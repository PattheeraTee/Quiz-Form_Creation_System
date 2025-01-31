// File: controller/formController.js
const formService = require('../service/formService');
const coverpageService = require('../service/coverpageService');
const sectionService = require('../service/sectionService');
const questionService = require('../service/questionService');
const themeService = require('../service/themeService');

// ********** Form **********
exports.createForm = async (req, res) => {
    try {
        const data = await formService.createNewForm(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getForm = async (req, res) => {
    try {
        const data = await formService.getFormDetails(req.params.formId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateForm = async (req, res) => {
    try {
        const data = await formService.updateFormData(req.params.formId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteForm = async (req, res) => {
    const { formId } = req.params; // ดึง formId จาก URL

    try {
        // เรียกใช้ Service เพื่อลบ Form
        const result = await formService.deleteForm(formId);

        res.status(200).json(result); // ส่งข้อความสำเร็จกลับไป
    } catch (error) {
        res.status(400).json({ error: error.message }); // ส่งข้อผิดพลาดกลับไป
    }
};

exports.getFormsByUser = async (req, res) => {
    const { userId } = req.params; // ดึง userId จาก URL

    try {
        // เรียกใช้ Service เพื่อดึงข้อมูล Forms
        const forms = await formService.getFormsByUser(userId);

        res.status(200).json(forms); // ส่ง Forms ที่ดึงมาให้ผู้ใช้
    } catch (error) {
        res.status(400).json({ error: error.message }); // ส่งข้อผิดพลาดกลับไป
    }
};

// ********** Coverpage **********
exports.updateCoverpage = async (req, res) => {
    try {
        const data = await coverpageService.updateCoverpage(req.params.coverpageId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ********** Section **********
exports.addSection = async (req, res) => {
    try {
        const data = await sectionService.addSection(req.params.formId, req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editSection = async (req, res) => {
    try {
        const { formId, sectionId } = req.params;
        const data = await sectionService.editSection(formId, sectionId, req.body);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        const data = await sectionService.deleteSection(req.params.formId, req.params.sectionId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ********** Question **********
exports.addQuestion = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const questionData = req.body;

        // เรียก Service เพื่อเพิ่ม Question
        const newQuestion = await questionService.addQuestion(sectionId, questionData);

        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editQuestion = async (req, res) => {
    try {
        const { sectionId, questionId } = req.params;
        const questionData = req.body;

        // เรียก Service เพื่อแก้ไข Question
        const updatedQuestion = await questionService.editQuestion(sectionId, questionId, questionData);

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const data = await questionService.deleteQuestion(req.params.sectionId, req.params.questionId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ********** Option **********
exports.addOption = async (req, res) => {
    try {
        const data = await questionService.addOption(req.params.questionId, req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editOption = async (req, res) => {
    const { questionId, optionId } = req.params; // ดึง questionId และ optionId จาก URL
    const optionData = req.body; // ดึงข้อมูลการแก้ไขจาก Body ของ Request

    try {
        // เรียกใช้ Service เพื่อแก้ไข Option
        const updatedQuestion = await questionService.editOption(questionId, optionId, optionData);

        res.status(200).json(updatedQuestion); // ส่งข้อมูล Question ที่อัปเดตกลับไป
    } catch (error) {
        res.status(400).json({ error: error.message }); // แสดงข้อความ Error หากเกิดปัญหา
    }
};

exports.deleteOption = async (req, res) => {
    try {
        const { questionId, optionId } = req.params;

        // เรียกใช้ Service เพื่อลบ Option
        const updatedQuestion = await questionService.deleteOption(questionId, optionId);

        res.status(200).json(updatedQuestion); // ส่งผลลัพธ์กลับไป
    } catch (error) {
        res.status(400).json({ error: error.message }); // ส่งข้อผิดพลาดกลับไป
    }
};

// ********** Theme **********
exports.editTheme = async (req, res) => {
    const { themeId } = req.params; // ดึง themeId จาก URL
    const themeData = req.body; // ดึงข้อมูลการแก้ไขจาก Body ของ Request

    try {
        // เรียกใช้ Service เพื่อแก้ไข Theme
        const updatedTheme = await themeService.editTheme(themeId, themeData);

        res.status(200).json(updatedTheme); // ส่งข้อมูล Theme ที่อัปเดตกลับไป
    } catch (error) {
        res.status(400).json({ error: error.message }); // แสดงข้อความ Error หากเกิดปัญหา
    }
};




