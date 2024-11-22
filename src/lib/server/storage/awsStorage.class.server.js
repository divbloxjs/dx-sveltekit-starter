import { env } from "$env/dynamic/private";
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

export class AwsStorage {
    /** @type {S3Client} */
    #s3Client;

    #region = "af-south-1";
    #publicPrefix = "public/";
    #bucketName = env.AWS_PRIVATE_BUCKET_NAME ?? "";
    #fileUploadMaxSizeInBytes = 20 * 1024 * 1024;

    /**
     * @param {Object} params
     * @param {string} [params.awsKey]
     * @param {string} [params.awsSecret]
     * @param {string} [params.region]
     * @param {string} [params.publicPrefix]
     * @param {string} [params.bucketName]
     * @param {number} [params.fileUploadMaxSizeInBytes]
     */
    constructor({ awsKey, awsSecret, region, publicPrefix, bucketName, fileUploadMaxSizeInBytes } = {}) {
        this.#region = region ?? this.#region;
        this.#fileUploadMaxSizeInBytes = fileUploadMaxSizeInBytes ?? this.#fileUploadMaxSizeInBytes;
        this.#publicPrefix = publicPrefix ?? this.#publicPrefix;
        this.#bucketName = bucketName ?? this.#bucketName;

        awsKey = awsKey ?? env.AWS_KEY ?? "";
        awsSecret = awsSecret ?? env.AWS_SECRET ?? "";

        this.#s3Client = new S3Client({
            region: this.#region,
            credentials: { accessKeyId: awsKey, secretAccessKey: awsSecret }
        });
    }

    getContainerIdentifier() {
        return this.#bucketName;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @returns {string}
     */
    getStaticUrl({ object_identifier, container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

        return this.#getUrlFromBucketAndObjectKey({ objectKey: object_identifier });
    }

    /**
     * @param {Object} params
     * @param {string} [params.container_identifier]
     * @returns {string}
     */
    getStaticBaseUrl({ container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

        return this.#getBaseUrlFromBucket();
    }

    /**
     * @param {Object} params
     * @param {File|Buffer|ArrayBuffer} params.file
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async uploadFile({ file, object_identifier, container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

        let fileBuffer = file;
        if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        }

        if (fileBuffer.byteLength > this.#fileUploadMaxSizeInBytes) {
            console.error(`Exceeded file size limit: ${fileBuffer.byteLength}`);
            return false;
        }

        try {
            await this.#putObjectInBucket({
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
                await this.#createBucket({ bucketName: this.#bucketName });
                await this.uploadFile({ file, object_identifier, container_identifier });
            } catch (createBucketError) {
                console.error(createBucketError);
                return false;
            }
        }

        return true;
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async deleteFile({ object_identifier, container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

        await this.#deleteObjectFromBucket({ objectKey: object_identifier });
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     * @param {boolean} [params.cloud_is_publicly_available]
     */
    async getUrlForDownload({ container_identifier, object_identifier, cloud_is_publicly_available = false }) {
        if (!container_identifier) container_identifier = this.#bucketName;

        if (cloud_is_publicly_available) {
            return this.getStaticUrl({ container_identifier, object_identifier: `public/${object_identifier}` });
        }

        return this.#getPresignedUrlForDownload({ container_identifier, object_identifier });
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async #getPresignedUrlForDownload({ object_identifier, container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

        const command = new GetObjectCommand({ Bucket: this.#bucketName, Key: object_identifier });

        return await getSignedUrl(this.#s3Client, command, { expiresIn: 3600 });
    }

    /**
     * @param {Object} params
     * @param {string} params.object_identifier
     * @param {string} [params.container_identifier]
     */
    async #getPresignedUrlForUpload({ object_identifier, container_identifier }) {
        if (container_identifier) this.#bucketName = container_identifier;

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
            new PutPublicAccessBlockCommand({ Bucket: bucketName, PublicAccessBlockConfiguration: { BlockPublicAcls: false } })
        );

        // FInally update ACL to public-read
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

        const commandOptions = { Bucket: bucketName, Key: objectKey, Body: file, ContentLength: Buffer.byteLength(file) };

        await this.#s3Client.send(new PutObjectCommand(commandOptions));
    }

    /**
     * @param {Object} params
     * @param {string} params.objectKey
     * @param {string} [params.bucketName]
     */
    async #deleteObjectFromBucket({ objectKey, bucketName }) {
        if (bucketName) this.#bucketName = bucketName;

        await this.#s3Client.send(new DeleteObjectCommand({ Bucket: this.#bucketName, Key: objectKey }));
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
        if (!bucketName) bucketName = this.#bucketName;

        return `https://${this.#bucketName}.s3.${this.#region}.amazonaws.com/`;
    }
}
