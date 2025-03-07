const { GoogleGenerativeAI } = require("@google/generative-ai");
const formService = require('../service/formService');

const genAI = new GoogleGenerativeAI("AIzaSyAOEzbP74dQnkwiWoHr9BHeQUbSzJ01e0Q");

exports.generateQuizForm = async (req, res) => {
    try {
        const { user_id, form_type, topic, numQuestions, language } = req.body;

        if (!user_id || !form_type || !topic || !numQuestions || !language) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // สร้าง prompt เพื่อให้ Gemini สร้างคำถามแบบทดสอบ
        const prompt = `
            Create ${numQuestions} multiple-choice quiz questions about ${topic}, 
            where each question has 4 options, and one of the options is correct.
            Also, generate a quiz title and a description for the quiz based on the given topic.
            The language of the questions, options, title, and description should be ${language}.
            Return the response in this JSON format:

            {
                "title": "string",
                "description": "string",
                "questions": [
                {
                    "type": "multiple_choice",
                    "question": "string",
                    "required": true,
                    "points": 1,
                    "options": [
                    { "text": "string", "is_correct": true },
                    { "text": "string" },
                    { "text": "string" },
                    { "text": "string" }
                    ]
                }
                ]
            }
            `;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generation_config: { "response_mime_type": "application/json" }
        });

        const result = await model.generateContent(prompt);
        const candidates = result.response?.candidates;

        if (!candidates || candidates.length === 0) {
            return res.status(500).json({ message: "No content generated from the API." });
        }

        let rawContent = candidates[0].content?.parts[0]?.text;
        rawContent = rawContent.replace(/```json|```/g, '').trim(); // ล้าง markdown ออก

        const generatedContent = JSON.parse(rawContent);
        const { title, description, questions: generatedQuestions } = generatedContent;

        // ✅ สร้างโครงสร้างข้อมูลให้ตรงกับ `createNewForm`
        const formData = {
            user_id,
            form_type,
            cover_page: {
                title: title,
                text_button: "เริ่มทำ",
                description: description
            },
            theme: {
                primary_color: "#03A9F4"
            },
            sections: [
                {
                    title: "Quiz Section",
                    questions: generatedQuestions.map(q => ({
                        type: q.type || "multiple_choice",
                        question: q.question,
                        required: q.required || false,
                        points: q.points || 1,
                        options: q.options.map(opt => ({
                            text: opt.text,
                            is_correct: opt.is_correct || false
                        }))
                    }))
                }
            ]
        };

        // ✅ ใช้ `createNewForm` จาก `formService`
        const newForm = await formService.createNewForm(formData);

        // ✅ ส่ง `form_id` กลับไป
        res.status(201).json({ form_id: newForm.form.form_id });

    } catch (error) {
        console.error("Error generating quiz form:", error);
        res.status(500).json({ message: "Failed to generate quiz form." });
    }
};
