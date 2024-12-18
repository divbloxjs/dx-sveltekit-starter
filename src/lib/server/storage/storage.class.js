export class StorageBase {
    //#region Getters/Setters
    /** @returns {string} */
    get containerIdentifier() {
        throw new Error("containerIdentifier getter() must be specified in implementation class.");
    }

    /** @param {string} containerIdentifier */
    set containerIdentifier(containerIdentifier) {
        throw new Error("containerIdentifier setter() must be specified in implementation class.");
    }

    //#endregion

    /**
     * @param {Object} params
     * @param {File|Buffer|ArrayBuffer} params.file
     * @param {string} params.object_identifier
     * @return {Promise<boolean>}
     */
    async uploadFile({ file, object_identifier }) {
        return false;
    }

    /**
     * @param {string} object_identifier
     * @return {Promise<Object>}
     */
    async deleteFile(object_identifier) {
        throw new Error("deleteFile() must be implemented");
    }

    /**
     * @param {string} object_identifier
     * @returns {string}
     */
    getStaticUrl(object_identifier) {
        throw new Error("getStaticUrl() must be implemented");
        return "";
    }

    /**
     * @returns {string}
     */
    getStaticBaseUrl() {
        throw new Error("getStaticBaseUrl() must be implemented");
        return "";
    }

    /**
     * @param {string} object_identifier
     */
    async getUrlForDownload(object_identifier) {
        throw new Error("getUrlForDownload() must be implemented");
        return "";
    }
}
