const { GoogleGenerativeAI } = require("@google/generative-ai");
const formService = require('../service/formService');

const genAI = new GoogleGenerativeAI("AIzaSyAXvPYCK4n1YO9UCpt6lnF7tWe7Eg_3qfg");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

exports.generateQuizForm = async (req, res) => {
    upload.array("images", 5)(req, res, async function (err) {
        if (err) return res.status(400).json({ message: "Error uploading images." });

        try {
            const { user_id, form_type, topic, numQuestions, language, education_level } = req.body;
            const imageFiles = req.files || [];

            if (!user_id || !form_type || !numQuestions || !language || !education_level) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            // ✅ แปลงรูปทั้งหมดเป็น Base64 (ถ้ามี)
            const base64Images = imageFiles.map(file => ({
                mime_type: file.mimetype,
                data: file.buffer.toString("base64")
            }));

            // ✅ Prompt รองรับระดับการศึกษา
            let prompt = `
                Create ${numQuestions} multiple-choice quiz questions suitable for the education level "${education_level}".
                The topic of the quiz is "${topic}".
                Each question must have 4 options, with one correct answer clearly marked.
                The correct answer should NOT always be in the first position.
                Also, generate a quiz title and a description based on the topic and education level.
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

            // ✅ ถ้ามีรูป ให้ AI วิเคราะห์ภาพด้วย
            if (base64Images.length > 0) {
                prompt = `
                    Create ${numQuestions} multiple-choice quiz questions based on the given images and topic "${topic}", designed for the education level "${education_level}". 
                    Analyze the content of the images to generate questions related to them.
                    Each question must have 4 options, with one correct answer clearly marked.
                    The correct answer should NOT always be in the first position.
                    Also, generate a quiz title and a description based on the images, topic, and education level.
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
            }

            // ✅ ส่งคำขอไปยัง Gemini API
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generation_config: { "response_mime_type": "application/json" }
            });

            const inputParts = [{ text: prompt }];
            base64Images.forEach(image => inputParts.push({ inline_data: image }));

            const result = await model.generateContent({ contents: [{ parts: inputParts }] });
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
                cover_page: { title, text_button: "เริ่มทำ", description },
                theme: { primary_color: "#03A9F4" },
                sections: [{ title: "Quiz Section", questions: generatedQuestions }]
            };

            // ✅ ใช้ `createNewForm` จาก `formService`
            const newForm = await formService.createNewForm(formData);

            // ✅ ส่ง `form_id` กลับไป
            res.status(201).json({ form_id: newForm.form.form_id });

        } catch (error) {
            console.error("Error generating quiz form:", error);
            res.status(500).json({ message: "Failed to generate quiz form." });
        }
    });
};