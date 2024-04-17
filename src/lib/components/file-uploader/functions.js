export const getFileExtension = (fileUrl) => {
    return fileUrl.substr(fileUrl.lastIndexOf(".") + 1);
};
