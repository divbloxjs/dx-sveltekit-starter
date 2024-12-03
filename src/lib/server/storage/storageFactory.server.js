import { env } from "$env/dynamic/private";
import { AwsStorage } from "./awsStorage.class.server";
import { DiskStorage } from "./diskStorage.class.server";
import { StorageBase } from "$lib/server/storage/storage.class.js";

export const storageProviders = {
    aws: "aws_s3",
    // azure: "azure",
    disk: "disk"
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
 * @typedef {Object} diskConfig
 * @property {string} [uploadFolder]
 * @property {string} [baseUrl]
 * @property {number} [fileUploadMaxSizeInBytes]
 * @property {boolean} [isPublic]
 */

/**
 * @param {{storageProvider: string}} conditions
 * @param {awsConfig | diskConfig} config
 * @returns {StorageBase}
 */
export const getStorage = (conditions, config = {}) => {
    // Based on a tenant, or env variable, or config, or something... Pick which storage implementation to use
    if (conditions.storageProvider === storageProviders.aws) {
        /** @type {awsConfig} */
        const awsConfig = config;

        if (!awsConfig.hasOwnProperty("isPublic")) awsConfig.isPublic = false;
        if (!awsConfig.awsKey) awsConfig.awsKey = env.AWS_KEY;
        if (!awsConfig.awsSecret) awsConfig.awsKey = env.AWS_SECRET;
        if (!awsConfig.region) awsConfig.region = env.AWS_REGION;
        if (!awsConfig.bucketName) {
            awsConfig.bucketName = env.AWS_PRIVATE_BUCKET_NAME;
            if (awsConfig.isPublic) {
                awsConfig.bucketName = env.AWS_PUBLIC_BUCKET_NAME;
            }
        }

        return new AwsStorage(awsConfig);
    } else if (conditions.storageProvider === storageProviders.disk) {
        /** @type {diskConfig} */
        const diskConfig = config;

        if (!diskConfig.uploadFolder) diskConfig.uploadFolder = env.UPLOAD_FOLDER;
        if (!diskConfig.baseUrl) diskConfig.baseUrl = env.PUBLIC_BASE_URL;

        return new DiskStorage(diskConfig);
    } else {
        const message = `Invalid storageProvider provided: '${conditions?.storageProvider}'. Configured implementations: [${Object.values(storageProviders).join(",")}]`;

        throw new Error(message);
    }
};
