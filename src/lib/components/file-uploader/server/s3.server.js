import { AWS_BUCKET_NAME, AWS_KEY, AWS_SECRET } from "$env/static/private";
import { getGuid } from "$lib/server/helpers";
import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getFileExtension } from "../functions";

export class S3Controller {
    #region;
    #fileUploadMaxSizeInBytes;
    #s3Client;
    constructor({ bucketName = undefined, fileUploadMaxSizeInBytes = 20 * 1024 * 1024 } = {}) {
        this.#region = "af-south-1";
        this.#fileUploadMaxSizeInBytes = fileUploadMaxSizeInBytes;

        this.bucketName = AWS_BUCKET_NAME;
        if (bucketName) this.bucketName = bucketName;
        this.#s3Client = new S3Client({
            region: this.#region,
            credentials: { accessKeyId: AWS_KEY, secretAccessKey: AWS_SECRET }
        });
    }

    getContainerIdentifier() {
        return this.bucketName;
    }

    getStaticUrl({ containerIdentifier = undefined, objectIdentifier }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;
        return this.#getUrlFromBucketAndObjectKey({ bucketName: this.bucketName, objectKey: objectIdentifier });
    }

    async uploadFile({ file, objectIdentifier, containerIdentifier = undefined }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;

        let fileBuffer = file;
        if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        }

        await this.#putObjectInBucket({
            bucketName: this.bucketName,
            objectKey: objectIdentifier,
            file: fileBuffer
        });
    }

    async deleteFile({ containerIdentifier, objectIdentifier }) {
        await this.#deleteObjectFromBucket(containerIdentifier, objectIdentifier);
    }

    async getPresignedUrlForDownload({ containerIdentifier = undefined, objectIdentifier }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;

        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: objectIdentifier });

        return await getSignedUrl(this.#s3Client, command, { expiresIn: 3600 });
    }

    async getPresignedUrlForUpload({ containerIdentifier = undefined, objectIdentifier }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;

        const command = new PutObjectCommand({ Bucket: this.bucketName, Key: objectIdentifier });

        return await getSignedUrl(this.#s3Client, command, { expiresIn: 3600 });
    }

    async #createBucket(bucketName) {
        await this.#s3Client.send(
            new CreateBucketCommand({
                Bucket: bucketName
            })
        );
    }

    async #listObjectsInBucket(bucketName) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            // The default and maximum number of keys returned is 1000. This limits it to
            // one for demonstration purposes.
            MaxKeys: 1000
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
        try {
            const result = await this.#s3Client.send(new ListBucketsCommand({}));
        } catch (err) {
            console.error(err);
        }
    }

    async #putObjectInBucket({ bucketName, objectKey, file }) {
        try {
            await this.#s3Client.send(
                new PutObjectCommand({ Bucket: bucketName, Key: objectKey, Body: file, ContentLength: Buffer.byteLength(file) })
            );
        } catch (err) {
            console.log(err);
        }
    }

    async #deleteObjectFromBucket(bucketName, objectKey) {
        if (bucketName) this.bucketName = bucketName;

        await this.#s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }));
    }

    #getUrlFromBucketAndObjectKey({ bucketName, objectKey }) {
        return `https://${bucketName}.s3.${this.#region}.amazonaws.com/${objectKey}`;
    }
}
