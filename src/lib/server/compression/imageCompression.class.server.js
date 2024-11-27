import sharp from "sharp";

export class ImageCompression {
    #configuration = {
        original: { maxDimension: 2500 },
        web: { maxDimension: 1080 },
        thumbnail: { maxDimension: 150 }
    };

    constructor() {
        // Can implement variability with how to compress images
    }

    async getAllFiles(imageArrayBuffer) {
        return this.#getAllImageBuffers(imageArrayBuffer);
    }

    /**
     * @typedef {Object} imagesReturn
     * @property {Buffer} original
     * @property {Buffer} web
     * @property {Buffer} thumbnail
     */

    /**
     * @param {ArrayBuffer| Buffer} imageArrayBuffer
     * @returns {Promise<imagesReturn>}
     */
    async #getAllImageBuffers(imageArrayBuffer) {
        const { width, height } = await sharp(imageArrayBuffer).metadata();

        const returnImageBuffers = {};
        for (const [type, { maxDimension }] of Object.entries(this.#configuration)) {
            const webSharpOptions = {
                fit: sharp.fit.contain
            };

            const uploadedImageMaxDimension = Math.max(width, height);
            if (width > height) {
                webSharpOptions.width = uploadedImageMaxDimension > maxDimension ? maxDimension : width;
            } else {
                webSharpOptions.height = uploadedImageMaxDimension > maxDimension ? maxDimension : height;
            }

            returnImageBuffers[type] = await sharp(imageArrayBuffer).resize(webSharpOptions).toBuffer();
        }

        return returnImageBuffers;
    }
}
