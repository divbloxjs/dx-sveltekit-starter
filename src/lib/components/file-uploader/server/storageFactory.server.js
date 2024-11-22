import { AwsStorage } from "./awsStorage.class.server";
import { DiskStorage } from "./diskStorage.class.server";

export const storageProviders = {
    aws: "aws",
    azure: "azure",
    disk: "disk"
};

/**
 * @param {Object} conditions
 * @param {*} config
 * @returns 
 */
export const getStorage = (conditions, config =) => {
    // Based on a tenant, or env variable, or config, or something... Pick which storage implementation to use
    if (conditions.cloudProvider === storageProviders.aws) {
        return new AwsStorage(config);
    } else if (conditions.cloudProvider === storageProviders.aws) {
        return new AwsStorage(config);
    }
};
