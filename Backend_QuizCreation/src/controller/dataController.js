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
};