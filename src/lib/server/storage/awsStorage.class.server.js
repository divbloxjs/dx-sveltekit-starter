import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    PutBucketAclCommand,
    PutObjectCommand,
    PutPublicAccessBlockCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageBase } from "$lib/server/storage/storage.class.js";

const logErrors = false;
const Result = {
    /**
     * @param {Object|string|undefined} value
     * @returns {{ok: boolean, value?: any}}
     */
    ok: (value = undefined) => {
        let returnObj = { ok: true };

        if (typeof value === "string") value = { message: value };

        if (value !== undefined) {
            returnObj = { ...returnObj, ...value };
        }

        return returnObj;
    },
    /**
     * @param {Object|string} error
     * @returns {{ok: boolean, error?: any}}
     */
    err: (error) => {
        let returnObj = { ok: false };

        if (typeof error === "string") error = { message: error };

        if (error !== undefined) {
            returnObj = { ...returnObj, ...error };
        }

        return returnObj;
    }
};

export class AwsStorage extends StorageBase {
    //#region Class Variables
    storageProvider = "aws_s3";
    /** @type {S3Client} */
    #s3Client;

    #region;
    #bucketName;
    #isPublic = false;
    #fileUploadMaxSizeInBytes = 20 * 1024 * 1024;

    //#endregion

    //#region Getters/Setters
    get containerIdentifier() {
        return this.#bucketName;
    }

    set containerIdentifier(containerIdentifier) {
        this.#bucketName = containerIdentifier;
    }

    //#endregion

    /**
     * @param {Object} params
     * @param {string} params.awsKey
     * @param {string} params.awsSecret
     * @param {string} params.region
     * @param {string} params.bucketName
     * @param {boolean} [params.isPublic]
     * @param {number} [params.fileUploadMaxSizeInBytes]
     */
    constructor({ awsKey, awsSecret, region, bucketName, fileUploadMaxSizeInBytes, isPublic }) {
        super();

        if (!bucketName) {
            throw new Error(`Invalid AWS bucket provided: '${bucketName}'`);
        }

        if (!awsKey || !awsSecret || !region) {
            throw new Error(`Invalid AWS credentials provided: awsKey:'${awsKey}', awsSecret:'${awsSecret}'`);
        }

        this.#region = region;
        this.#bucketName = bucketName;

        this.#fileUploadMaxSizeInBytes = fileUploadMaxSizeInBytes ?? this.#fileUploadMaxSizeInBytes;
        this.#isPublic = isPublic ?? this.#isPublic;

        this.#s3Client = new S3Client({
            region: this.#region,
            credentials: { accessKeyId: awsKey, secretAccessKey: awsSecret }
        });
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @returns {string}
     */
    getStaticUrl({ object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        return this.#getUrlFromBucketAndObjectKey({ objectKey: object_identifier, bucketName: container_identifier });
    }

    /**
     * @returns {string}
     */
    getStaticBaseUrl() {
        return this.#getBaseUrlFromBucket();
    }

    /**
     * @param {Object} params
     * @param {File|Buffer|ArrayBuffer} params.file
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @returns {Promise<{ok: boolean, values?: any, error?: any}>}
     */
    async uploadFile({ file, object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        let fileBuffer = file;
        if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        }

        if (fileBuffer.byteLength > this.#fileUploadMaxSizeInBytes) {
            return Result.err(`Exceeded file size limit: ${fileBuffer.byteLength}`);
        }

        try {
            const result = await this.#putObjectInBucket({
                bucketName: container_identifier,
                objectKey: object_identifier,
                file: fileBuffer
            });

            if (!result.ok) {
                return Result.err({ error: result.error });
            }

            return Result.ok();
        } catch (error) {
            if (error?.Code !== "NoSuchBucket") {
                return Result.err(error);
            }

            try {
                const createBucketResult = await this.#createBucket({ bucketName: this.#bucketName, isPublic: this.#isPublic });
                if (!createBucketResult.ok) {
                    return Result.err(createBucketResult.error);
                }

                const uploadFileResult = await this.uploadFile({ file, object_identifier });
                if (!uploadFileResult.ok) {
                    return Result.err(uploadFileResult.error);
                }
            } catch (error) {
                return Result.err({ error });
            }
        }

        return Result.ok();
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @returns {Promise<{ok: boolean, value?: any}>}
     */
    async deleteFile({ object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        return await this.#deleteObjectFromBucket({ objectKey: object_identifier, bucketName: container_identifier });
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async getUrlForDownload({ object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        if (this.#isPublic) {
            return this.getStaticUrl({ object_identifier, container_identifier });
        }

        return this.#getPresignedUrlForDownload({ object_identifier, container_identifier });
    }

    //#region Private Implementation Methods
    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async #getPresignedUrlForDownload({ object_identifier, container_identifier }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        const command = new GetObjectCommand({ Bucket: container_identifier, Key: object_identifier });

        return await getSignedUrl(this.#s3Client, command, { expiresIn: 3600 });
    }

    /**
     * @param {string} object_identifier
     */
    async #getPresignedUrlForUpload(object_identifier) {
        const command = new PutObjectCommand({ Bucket: this.#bucketName, Key: object_identifier });

        return await getSignedUrl(this.#s3Client, command, { expiresIn: 3600 });
    }

    /**
     * @param {Object} params
     * @param {string} params.bucketName
     * @param {boolean} [params.isPublic]
     * @returns {Promise<{ok: boolean, value?: any, error?: any}>}
     */
    async #createBucket({ bucketName, isPublic }) {
        if (!isPublic) {
            // Default bucket creation has restricted access
            const result = await this.#s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            if (result["$metadata"].httpStatusCode !== 200) {
                return Result.err({ error: result["$metadata"] });
            }

            return Result.ok();
        }

        // https://stackoverflow.com/questions/76330998/aws-s3-invalidbucketaclwithobjectownershipbucket-cannot-have-acls-set-with-obje
        // Create new bucket without enforcing bucket owner writes
        const createBucketResult = await this.#s3Client.send(
            new CreateBucketCommand({ Bucket: bucketName, ObjectOwnership: "ObjectWriter" })
        );

        // Update public access to not be blocked
        const updateAccessResult = await this.#s3Client.send(
            new PutPublicAccessBlockCommand({
                Bucket: bucketName,
                PublicAccessBlockConfiguration: { BlockPublicAcls: false }
            })
        );

        // Finally update ACL to public-read
        const updateAclResult = await this.#s3Client.send(new PutBucketAclCommand({ Bucket: bucketName, ACL: "public-read" }));
        console.log("createBucket createBucketResult", createBucketResult);
        console.log("createBucket updateAccessResult", updateAccessResult);
        console.log("createBucket updateAclResult", updateAclResult);
        return Result.ok();
    }

    /**
     * @param {Object} [params]
     * @param {number} [params.maxKeys]
     * @param {string} [params.bucketName]
     */
    async #listObjectsInBucket({ bucketName, maxKeys } = {}) {
        const command = new ListObjectsV2Command({
            Bucket: this.#bucketName,
            MaxKeys: maxKeys ?? 1000
        });

        let isTruncated = true;
        const objects = [];
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await this.#s3Client.send(command);
            isTruncated = IsTruncated;
            if (!IsTruncated) break;
            objects.push(...Contents);
            command.input.ContinuationToken = NextContinuationToken;
        }

        return objects;
    }

    async #listBuckets() {
        const result = await this.#s3Client.send(new ListBucketsCommand({}));
        return result;
    }

    /**
     * @param {Object} params
     * @param {Buffer} params.file
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
     * @returns {Promise<{ok: boolean, error?: Object}>}
     */
    async #putObjectInBucket({ file, objectKey, bucketName }) {
        if (bucketName) this.#bucketName = bucketName;

        const commandOptions = {
            Bucket: bucketName,
            Key: objectKey,
            Body: file,
            ContentLength: Buffer.byteLength(file)
        };

        const result = await this.#s3Client.send(new PutObjectCommand(commandOptions));
        if (result["$metadata"]?.httpStatusCode !== 200) {
            return Result.err({ error: result["$metadata"] });
        }

        return Result.ok();
    }

    /**
     * @param {Object} params
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
     * @returns {Promise<{ok: boolean, value?: any}>}
     */
    async #deleteObjectFromBucket({ objectKey, bucketName }) {
        if (bucketName) this.#bucketName = bucketName;

        const result = await this.#s3Client.send(new DeleteObjectCommand({ Bucket: this.#bucketName, Key: objectKey }));
        if (result["$metadata"]?.httpStatusCode !== 200) {
            return Result.err({ error: result["$metadata"] });
        }

        return Result.ok();
    }

    /**
     * @param {Object} params
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
     * @returns {string}
     */
    #getUrlFromBucketAndObjectKey({ objectKey, bucketName }) {
        if (!bucketName) bucketName = this.#bucketName;

        return `https://${bucketName}.s3.${this.#region}.amazonaws.com/${objectKey}`;
    }

    /**
     * @param {Object} [params]
     * @param {string} [params.bucketName]
     * @returns {string}
     */
    #getBaseUrlFromBucket({ bucketName } = {}) {
        if (bucketName) this.#bucketName = bucketName;

        return `https://${this.#bucketName}.s3.${this.#region}.amazonaws.com/`;
    }

    //#endregion
}
