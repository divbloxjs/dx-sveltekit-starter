export class StorageBase {
    //#region Getters/Setters
    /** @returns {string} */
    get containerIdentifier() {
        return "";
    }

    /** @param {string} _containerIdentifier */
    set containerIdentifier(_containerIdentifier) {
        // Set to custom implementation of the containerIdentifier
    }

    /** @returns {string} */
    get publicContainerIdentifier() {
        return "";
    }

    /** @param {string} _publicContainerIdentifier */
    set publicContainerIdentifier(_publicContainerIdentifier) {
        // Set to custom implementation of the containerIdentifier
    }

    //#endregion

    /**
     * @param {Object} params
     * @param {File|Buffer|ArrayBuffer} params.file
     * @param {string} params.object_identifier
     * @param {boolean} [params.isPublic]
     * @return {Promise<boolean>}
     */
    async uploadFile({ file, object_identifier, isPublic }) {
        return false;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async deleteFile({ object_identifier, container_identifier }) {
        return false;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @returns {string}
     */
    getStaticUrl({ object_identifier, container_identifier }) {
        return "";
    }

    /**
     * @param {Object} params
     * @param {string} [params.container_identifier]
     * @returns {string}
     */
    getStaticBaseUrl({ container_identifier }) {
        return "";
    }


}
