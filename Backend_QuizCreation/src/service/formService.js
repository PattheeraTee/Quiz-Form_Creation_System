const { v4: uuidv4 } = require('uuid');
const { filterRestrictedFields } = require('../utils/filterRestrictedFields');
const { formRestrictedFields } = require('../constants/restrictedFields');
const formRepository = require('../repository/formRepository');
const coverpageRepository = require('../repository/coverpageRepository');
const sectionRepository = require('../repository/sectionRepository');
const themeRepository = require('../repository/themeRepository');
const questionRepository = require('../repository/questionRepository');
const resultRepository = require('../repository/resultRepository');
const responseRepository = require('../repository/responseReposity');
const userRepository = require('../repository/userRepository');

//สร้างฟอร์มใหม่
exports.createNewForm = async (requestData) => {
    try {
        // สร้าง ID ล่วงหน้า
        const formId = uuidv4();
        const coverPageId = uuidv4();
        const themeId = uuidv4();
        const sectionId = uuidv4();

        // สร้าง Coverpage
        const coverPage = await coverpageRepository.createCoverpage({
            cover_page_id: coverPageId,
            form_id: formId
        });

        // สร้าง Theme
        const theme = await themeRepository.createTheme({
            theme_id: themeId,
            form_id: formId,
        });

        // สร้าง Section
        const section = await sectionRepository.createSection({
            section_id: sectionId,
            form_id: formId
        });

        // สร้าง Form และเชื่อมโยงกับ Coverpage, Theme, และ Section
        const form = await formRepository.createForm({
            form_id: formId,
            user_id: requestData.user_id,
            form_type: requestData.form_type,
            cover_page_id: coverPageId,
            theme_id: themeId,
            section_id: [sectionId],
            result_id: [], // ค่าเริ่มต้นสำหรับ result_id
        });

        // อัปเดต forms array ใน User
        await userRepository.addFormToUser(requestData.user_id, formId);

        // ส่งคืนผลลัพธ์
        return { form, coverPage, theme, section };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการสร้างฟอร์ม: ${error.message}`);
    }
};

// แก้ไขข้อมูลฟอร์ม
exports.updateFormData = async (formId, updateData) => {
    try {
        // ตรวจสอบว่าฟอร์มมีอยู่
        await formRepository.validateFormExistence(formId);

        // กรองฟิลด์ต้องห้าม
        const updateFields = filterRestrictedFields(updateData, formRestrictedFields);

        if (Object.keys(updateFields).length === 0) {
            throw new Error('No valid fields to update');
        }

        // อัปเดตข้อมูลในฟอร์ม
        const updatedForm = await formRepository.updateForm(formId, updateFields);

        return updatedForm;
    } catch (error) {
        throw new Error(`Error updating form: ${error.message}`);
    }
};

// ดึงข้อมูลฟอร์ม
exports.getFormDetails = async (formId) => {
    try {
        // ตรวจสอบว่าฟอร์มมีอยู่จริง
        await formRepository.validateFormExistence(formId);

        // ดึงข้อมูลฟอร์ม
        const form = await formRepository.getForm(formId);

        // ดึงข้อมูล Coverpage และ Theme
        const coverPage = await coverpageRepository.getCoverpage(formId);
        const theme = await themeRepository.getTheme(formId);

        // ดึงข้อมูล Sections และ Questions
        const sections = await sectionRepository.getSections(formId);

        for (let section of sections) {
            const questions = await questionRepository.getQuestionsBySection(section.section_id);
            section.questions = questions.map((question) => ({
                ...question,
                options: question.options, // แสดง options ในแต่ละคำถาม
            }));
        }

        // รวมข้อมูลทั้งหมดและส่งกลับ
        return { form, coverPage, theme, sections };
    } catch (error) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลแบบฟอร์ม: ${error.message}`);
    }
};

// ลบฟอร์ม
exports.deleteForm = async (formId) => {
    try {
        // ตรวจสอบว่า Form มีอยู่
        const form = await formRepository.validateFormExistence(formId);

        // ลบ Coverpage
        await coverpageRepository.deleteCoverpage(form.cover_page_id);

        // ลบ Sections ที่เกี่ยวข้อง
        if (form.section_id && form.section_id.length > 0) {
            await sectionRepository.deleteSections(form.section_id);
        }

        // ลบ Results ที่เกี่ยวข้อง
        if (form.result_id && form.result_id.length > 0) {
            await resultRepository.deleteResults(form.result_id);
        }

        // ลบ Theme
        await themeRepository.deleteTheme(form.theme_id);

        // ลบ Responses ที่เกี่ยวข้อง
        if (form.response && form.response.length > 0) {
            await responseRepository.deleteResponses(form.response);
        }

        // ลบ Form
        await formRepository.deleteForm(formId);

        // ลบ form_id จาก User
        await userRepository.removeFormFromUser(form.user_id, formId);

        return { message: 'Form and related data deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting form: ${error.message}`);
    }
};

// ดึงข้อมูลฟอร์มทั้งหมดของ User
exports.getFormsByUser = async (userId) => {
    try {
      // ตรวจสอบว่า User มีอยู่
      await userRepository.validateUserExistence(userId);
  
      // ดึง forms ของ User
      const formIds = await userRepository.getFormsByUser(userId);
  
      if (formIds.length === 0) {
        return {
          message: 'No forms found for the specified user',
          forms: [],
        };
      }
  
      // ดึงข้อมูลฟอร์มจาก formIds
      const forms = await formRepository.getFormsByIds(formIds);
  
      // ดึงข้อมูล Coverpages และ Themes
      const coverpages = await coverpageRepository.getCoverpagesByFormIds(formIds);
      const themes = await themeRepository.getThemesByFormIds(formIds);
  
      // รวมข้อมูล Forms, Coverpages, และ Themes
      const result = forms.map((form) => {
        const coverpage = coverpages.find((cp) => cp.form_id === form.form_id) || {};
        const theme = themes.find((th) => th.form_id === form.form_id) || {};
  
        return {
          form_id: form.form_id,
          form_type: form.form_type,
          user_id: form.user_id,
          coverpage: {
            cover_page_id: coverpage.cover_page_id || null,
            title: coverpage.title || null,
            cover_page_image: coverpage.cover_page_image || null,
          },
          theme: {
            theme_id: theme.theme_id || null,
            primary_color: theme.primary_color || null,
          },
        };
      });
  
      return {
        message: 'Forms retrieved successfully',
        forms: result,
      };
    } catch (error) {
      throw new Error(`Error fetching forms: ${error.message}`);
    }
  };
  