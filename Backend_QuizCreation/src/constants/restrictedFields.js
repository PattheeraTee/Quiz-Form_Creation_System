// restrictedFields.js
module.exports = {
    formRestrictedFields: ['form_id', 'section_id', 'result_id', 'user_id', 'theme_id'],
    coverpageRestrictedFields: ['cover_page_id', 'form_id'],
    sectionRestrictedFields: ['section_id', 'form_id'],
    questionRestrictedFields: ['question_id', 'section_id', 'options'],
    optionRestrictedFields: ['option_id', 'question_id', 'section_id'],
    themeRestrictedFields: ['theme_id', 'form_id'],
};
