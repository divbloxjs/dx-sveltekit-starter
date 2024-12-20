import { ImageCompression } from "./imageCompression.class.server.js";
import { FileCompression } from "./fileCompression.class.server.js";
import { CompressionBase } from "./compression.class.js";

export const fileType = {
    image: "image",
    file: "file"
    // video: "video"
    // document: "document
    // etc...
};

/**
 * @typedef {Object} imageConfig
 * @property {string} [original]
 * @property {string} [web]
 * @property {string} [thumbnail]
 */

/**
 * @typedef {Object} fileConfig
 * @property {boolean} [original]
 */

/**
 * @param {{fileType: string}} conditions
 * @param {imageConfig|fileConfig} [config]
 * @returns {CompressionBase}
 */
export const getCompression = (conditions, config = {}) => {
    // Based on a tenant, or env variable, or config, or something... Pick which storage implementation to use
    if (conditions.fileType === fileType.image) {
        return new ImageCompression(config);
    } else if (conditions.fileType === fileType.file) {
        return new FileCompression(config);
    } else {
        throw new Error(`Invalid fileType provided: '${conditions?.fileType}'. Configured options: [${Object.values(fileType).join(",")}]`);
    }
};
