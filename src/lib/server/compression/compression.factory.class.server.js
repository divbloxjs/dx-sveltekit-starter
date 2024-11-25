import { env } from "$env/dynamic/private";
import { ImageCompression } from "./imageCompression.class.server.js";
import { FileCompression } from "./fileCompression.class.server.js";

export const fileType = {
    image: "image",
    file: "file"
    // video: "video"
    // document: "document
    // etc...
};

/**
 * @typedef {Object} awsConfig
 * @property {string} [bucketName]
 * @property {string} [awsKey]
 * @property {string} [awsSecret]
 * @property {string} [region]
 * @property {number} [fileUploadMaxSizeInBytes]
 * @property {boolean} [isPublic]
 */

/**
 *
 * @param {{fileType: string}} conditions
 * @param {awsConfig | {fileType?: string}} config
 * @returns {ImageCompression|FileCompression}
 */
export const getCompression = (conditions, config = {}) => {
    // Based on a tenant, or env variable, or config, or something... Pick which storage implementation to use
    if (conditions.fileType === fileType.image) {
        return new ImageCompression(config);
    } else if (conditions.fileType === fileType.file) {
        return new FileCompression(config);
    } else {
        throw new Error(`Invalid storageProvider provided: ${conditions?.storageProvider}`);
    }
};
