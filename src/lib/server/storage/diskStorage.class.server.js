import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { existsSync } from "fs";

import sharp from "sharp";
import { StorageBase, StorageResult } from "$lib/server/storage/storage.class.js";

export class DiskStorage extends StorageBase {
    storageProvider = "disk";

    #uploadFolder;
    #baseUrl;

    /**
     * @param {Object} params
     * @param {string} params.uploadFolder
     * @param {string} params.baseUrl
     */
    constructor({ uploadFolder, baseUrl }) {
        super();
        if (!uploadFolder || !baseUrl) {
            throw new Error(`Invalid parameters provided: uploadFolder:'${uploadFolder}', baseUrl:'${baseUrl}'`);
        }

        this.#uploadFolder = uploadFolder;
        this.#baseUrl = baseUrl;
    }

    get containerIdentifier() {
        return this.#uploadFolder;
    }

    set containerIdentifier(containerIdentifier) {
        this.#uploadFolder = containerIdentifier;
    }

    /**
     * @param {Object} params
     * @param {File|Buffer|ArrayBuffer} params.file
     * @param {string} params.object_identifier
     * @param {boolean} [params.isPublic]
     * @param {string?} [params.container_identifier]
     */
    async uploadFile({ file, object_identifier, isPublic = false, container_identifier }) {
        if (!container_identifier) container_identifier = this.#uploadFolder;
        const localStaticFilePath = `${container_identifier}/${object_identifier}`;

        if (!existsSync(this.#uploadFolder)) {
            mkdirSync(this.#uploadFolder);
        }

        writeFileSync(localStaticFilePath, Buffer.from(file));

        return StorageResult.ok();
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier Unique identifier for the file
     * @param {string?} [params.container_identifier] Unique identifier for the folder/container the file is located
     * @returns {Promise<{ok: boolean, value?: any}>}
     */
    async deleteFile({ object_identifier, container_identifier }) {
        console.log("deleteFile");
        console.log("object_identifier", object_identifier);
        console.log("container_identifier", container_identifier);

        if (!container_identifier) container_identifier = this.#uploadFolder;
        const localStaticFilePath = `${container_identifier}/${object_identifier}`;
        console.log("localStaticFilePath", localStaticFilePath);

        try {
            unlinkSync(localStaticFilePath);
        } catch (error) {
            return StorageResult.err({ error });
        }

        return StorageResult.ok();
    }

    /**
     * @param {Object} params
     * @param {string[]} params.object_identifiers
     */
    async deleteFiles({ object_identifiers = [] }) {
        for (const object_identifier of object_identifiers) {
            this.deleteFile({ object_identifier });
        }
    }

    async getUrlForDownload({ object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#uploadFolder;

        return `${container_identifier}/${object_identifier}`;
    }

    async getAllImageBuffers(imageArrayBuffer) {
        const returnImageBuffers = {};
        const { width, height } = await sharp(imageArrayBuffer).metadata();

        returnImageBuffers["original"] = imageArrayBuffer;

        for (const size of [
            { type: "web", maxDimension: 1080 },
            { type: "thumbnail", maxDimension: 150 }
        ]) {
            const webSharpOptions = {
                fit: sharp.fit.contain
            };

            const uploadedImageMaxDimension = Math.max(width, height);
            if (width > height) {
                webSharpOptions.width = uploadedImageMaxDimension > size.maxDimension ? size.maxDimension : width;
            } else {
                webSharpOptions.height = uploadedImageMaxDimension > size.maxDimension ? size.maxDimension : height;
            }

            const newImageBuffer = await sharp(imageArrayBuffer).resize(webSharpOptions).toBuffer();
            returnImageBuffers[size.type] = newImageBuffer;
        }

        return returnImageBuffers;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @returns {string}
     */
    getStaticUrl({ object_identifier }) {
        return `${this.#baseUrl}/${this.#uploadFolder}/${object_identifier}`;
    }

    /**
     * @returns {string}
     */
    getStaticBaseUrl() {
        return `${this.#baseUrl}/${this.#uploadFolder}`;
    }
}
