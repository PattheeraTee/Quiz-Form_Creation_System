// Utility สำหรับกรองฟิลด์ที่ห้ามแก้ไข
const filterRestrictedFields = (data, restrictedFields) => {
    return Object.keys(data)
        .filter((key) => !restrictedFields.includes(key))
        .reduce((filteredData, key) => {
            filteredData[key] = data[key];
            return filteredData;
        }, {});
};

module.exports = { filterRestrictedFields };
