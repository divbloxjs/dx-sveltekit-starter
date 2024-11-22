import { env } from "$env/dynamic/private";
import { AwsStorage } from "./awsStorage.class.server";
import { DiskStorage } from "./diskStorage.class.server";

export const storageProviders = {
    aws: "aws",
    azure: "azure",
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
 *
 * @param {{storageProvider: string}} conditions
 * @param {awsConfig | {uploadFolder?: string}} config
 * @returns {AwsStorage|DiskStorage}
 */
export const getStorage = (conditions, config = {}) => {
    // Based on a tenant, or env variable, or config, or something... Pick which storage implementation to use
    if (conditions.storageProvider === storageProviders.aws) {
        if (!config.bucketName) {
            config.bucketName = env.AWS_PRIVATE_BUCKET_NAME ?? "";
            if (config.isPublic) {
                config.bucketName = env.AWS_PUBLIC_BUCKET_NAME ?? "";
            }
        }

        return new AwsStorage(config);
    } else if (conditions.storageProvider === storageProviders.disk) {
        return new DiskStorage(config);
    } else if (conditions.storageProvider === storageProviders.aws) {
        return new AwsStorage(config);
        // return new SftpStorage(config);
    } else {
        throw new Error(`Invalid storageProvider provided: ${conditions?.storageProvider}`);
    }
};
