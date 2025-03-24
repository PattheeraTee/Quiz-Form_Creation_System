const fs = require("fs");
const path = require("path");

module.exports = {
    getLanguages: async (req, res) => {
        try {
        const languagesPath = path.join(__dirname, "../data/languages.json");
        const languagesData = fs.readFileSync(languagesPath, "utf-8");
        const languages = JSON.parse(languagesData).languages.map(
            (lang) => lang.native
        );
        res.status(200).json(languages);
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        }
    },
    getEducationLevels: async (req, res) => {
        try {
            const educationPath = path.join(__dirname, "../data/education-level.json");
            const educationData = fs.readFileSync(educationPath, "utf-8");
            const educationLevels = JSON.parse(educationData).education_levels;

            res.status(200).json(educationLevels);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};