import { env } from "$env/dynamic/private";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import sharp from "sharp";
import { existsSync } from "fs";
import { env as publicEnv } from "$env/dynamic/public";

export class DiskStorage {
    #uploadFolder = env.UPLOAD_FOLDER;
    #baseUrl = publicEnv.PUBLIC_BASE_URL;

    /**
     * @param {Object} [params]
     * @param {string} [params.uploadFolder]
     */
    constructor({ uploadFolder } = {}) {
        this.#uploadFolder = uploadFolder ?? this.#uploadFolder;
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
     * @param {string} [params.container_identifier]
     */
    async uploadFile({ file, object_identifier, isPublic = false, container_identifier }) {
        const localStaticFilePath = `${this.#uploadFolder}/${object_identifier}`;

        if (!existsSync(this.#uploadFolder)) {
            mkdirSync(this.#uploadFolder);
        }

        writeFileSync(localStaticFilePath, Buffer.from(file));

        return localStaticFilePath;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     */
    async deleteFile({ object_identifier }) {
        const localStaticFilePath = `${this.#uploadFolder}/${object_identifier}`;
        const result = unlinkSync(localStaticFilePath);
        console.log("result", result);
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

    async getUrlForDownload({ object_identifier }) {
        return `${this.#uploadFolder}/${object_identifier}`;
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

    getContainerIdentifier() {
        return this.#uploadFolder;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @returns {string}
     */
    getStaticUrl({ object_identifier }) {
        return `${this.#baseUrl}${this.#uploadFolder}/${object_identifier}`;
    }

    /**
     * @returns {string}
     */
    getStaticBaseUrl() {
        return `${this.#baseUrl}/${this.#uploadFolder}`;
    }
}
