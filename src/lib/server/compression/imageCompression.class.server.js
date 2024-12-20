import sharp from "sharp";
import { CompressionBase } from "./compression.class";

export class ImageCompression extends CompressionBase {
    #configuration = {
        original: { maxDimension: 2500 },
        web: { maxDimension: 1080 },
        thumbnail: { maxDimension: 150 }
    };

    constructor() {
        super();
        // Can implement variability with how to compress images
    }

    /**
     * @param {File|Buffer|ArrayBuffer} file
     * @returns {Promise<imagesReturn>}
     */
    async getFinalFileSet(file) {
        let arrayBuffer = file;
        if (file instanceof File) {
            arrayBuffer = await file.arrayBuffer();
        }

        return this.getAllArrayBuffers(arrayBuffer);
    }

    /**
     * @typedef {Object} imagesReturn
     * @property {ArrayBuffer} original
     * @property {ArrayBuffer} web
     * @property {ArrayBuffer} thumbnail
     */

    /**
     * @param {ArrayBuffer} arrayBuffer
     * @returns {Promise<imagesReturn>}
     */
    async getAllArrayBuffers(arrayBuffer) {
        const { width, height } = await sharp(arrayBuffer).metadata();

        if (!width || !height) {
            throw new Error("Invalid imageArrayBuffer provided");
        }

        const returnArrayBuffers = {};
        for (const [type, { maxDimension }] of Object.entries(this.#configuration)) {
            const webSharpOptions = {
                width,
                height,
                fit: sharp.fit.contain
            };

            const uploadedImageMaxDimension = Math.max(width, height);
            if (width > height) {
                webSharpOptions.width = uploadedImageMaxDimension > maxDimension ? maxDimension : width;
            } else {
                webSharpOptions.height = uploadedImageMaxDimension > maxDimension ? maxDimension : height;
            }

            returnArrayBuffers[type] = await sharp(arrayBuffer).resize(webSharpOptions).toBuffer();
        }

        return returnArrayBuffers;
    }
}
