export class StorageBase {
    /**
     * Storage implementation used to save this file
     * @type {string}
     */
    #storageProvider = "";

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
     * @param {string} params.object_identifier Unique identifier for the file
     * @param {string} [params.container_identifier] Unique identifier for the folder/container the file is located
     * @return {Promise<{ok: boolean, values?: any, error?: any}>}
     */
    async uploadFile({ file, object_identifier, container_identifier }) {
        throw new Error("uploadFile() must be implemented");
        return { ok: false };
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier Unique identifier for the file
     * @param {string} [params.container_identifier] Unique identifier for the folder/container the file is located
     * @returns {Promise<{ok: boolean, value?: any}>}
     */
    async deleteFile({ object_identifier, container_identifier }) {
        throw new Error("deleteFile() must be implemented");
        return { ok: false };
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier Unique identifier for the file
     * @param {string} [params.container_identifier] Unique identifier for the folder/container the file is located
     */
    getStaticUrl({ object_identifier, container_identifier }) {
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
     * @param {Object} params
     * @param {string} params.object_identifier Unique identifier for the file
     * @param {string} [params.container_identifier] Unique identifier for the folder/container the file is located
     */
    async getUrlForDownload({ object_identifier, container_identifier }) {
        throw new Error("getUrlForDownload() must be implemented");
        return "";
    }
}
