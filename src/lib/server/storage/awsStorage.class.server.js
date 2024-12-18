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

export class AwsStorage extends StorageBase {
    //#region Class Variables
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
     * @param {string} object_identifier
     * @returns {string}
     */
    getStaticUrl(object_identifier) {
        return this.#getUrlFromBucketAndObjectKey({ objectKey: object_identifier });
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
     */
    async uploadFile({ file, object_identifier }) {
        let fileBuffer = file;
        if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        }

        if (fileBuffer.byteLength > this.#fileUploadMaxSizeInBytes) {
            console.error(`Exceeded file size limit: ${fileBuffer.byteLength}`);
            return false;
        }

        try {
            const result = await this.#putObjectInBucket({
                bucketName: this.#bucketName,
                objectKey: object_identifier,
                file: fileBuffer
            });

            return true;
        } catch (error) {
            console.error(error);
            if (error?.Code !== "NoSuchBucket") {
                return false;
            }

            try {
                await this.#createBucket({ bucketName: currentBucketName });
                await this.uploadFile({ file, object_identifier, isPublic });
            } catch (createBucketError) {
                console.error(createBucketError);
                return false;
            }
        }

        return true;
    }

    /**
     * @param {string} object_identifier
     * @returns {Promise<import("@aws-sdk/client-s3").DeleteBucketCommandOutput>}
     */
    async deleteFile(object_identifier) {
        return await this.#deleteObjectFromBucket({ objectKey: object_identifier });
    }

    /**
     * @param {string} object_identifier
     */
    async getUrlForDownload(object_identifier) {
        if (this.#isPublic) {
            return this.getStaticUrl(object_identifier);
        }

        return this.#getPresignedUrlForDownload(object_identifier);
    }

    //#region Private Implementation Methods
    /**
     * @param {string} object_identifier
     */
    async #getPresignedUrlForDownload(object_identifier) {
        const command = new GetObjectCommand({ Bucket: this.#bucketName, Key: object_identifier });

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
     * @returns {Promise<boolean>}
     */
    async #createBucket({ bucketName, isPublic }) {
        if (!isPublic) {
            await this.#s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            return true;
        }

        // https://stackoverflow.com/questions/76330998/aws-s3-invalidbucketaclwithobjectownershipbucket-cannot-have-acls-set-with-obje
        // Create new bucket without enforcing bucket owner writes
        await this.#s3Client.send(new CreateBucketCommand({ Bucket: bucketName, ObjectOwnership: "ObjectWriter" }));

        // Update public access to not be blocked
        await this.#s3Client.send(
            new PutPublicAccessBlockCommand({
                Bucket: bucketName,
                PublicAccessBlockConfiguration: { BlockPublicAcls: false }
            })
        );

        // Finally update ACL to public-read
        await this.#s3Client.send(new PutBucketAclCommand({ Bucket: bucketName, ACL: "public-read" }));

        return true;
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
        return await this.#s3Client.send(new ListBucketsCommand({}));
    }

    /**
     * @param {Object} params
     * @param {Buffer} params.file
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
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
        console.log("putObjectInBucket result", result);

        if (result["$metadata"]?.httpStatusCode !== 200) {
            return { ok: false, error: result["$metadata"] };
        }

        return { ok: true };
    }

    /**
     * @param {Object} params
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
     * @returns {Promise<import("@aws-sdk/client-s3").DeleteBucketCommandOutput>}
     */
    async #deleteObjectFromBucket({ objectKey, bucketName }) {
        if (bucketName) this.#bucketName = bucketName;

        const result = await this.#s3Client.send(new DeleteObjectCommand({ Bucket: this.#bucketName, Key: objectKey }));
        console.log("deleteObjectFromBucket", result);
        return result;
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
