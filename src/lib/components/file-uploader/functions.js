export const getFileExtension = (filePath) => {
    if (!filePath.includes(".")) return "";

    return filePath.substr(filePath.lastIndexOf(".") + 1);
};

export const getFileWithoutExtension = (filePath) => {
    if (!filePath.includes(".")) return filePath;

    return filePath.substr(0, filePath.lastIndexOf("."));
};

/**
 * @param {string} filePath The file path to mutate
 * @param {*} stringToInsert The string to insert before the file extension.
 *
 * NOTE: Remember to include separators in the {stringToInsert} i.e. _,-,+ etc
 *
 * @returns {string} the processed filePath
 */
export const insertBeforeFileExtension = (filePath, stringToInsert = "") => {
    return `${getFileWithoutExtension(filePath)}${stringToInsert}.${getFileExtension(filePath)}`;
};
