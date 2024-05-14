import { AWS_PRIVATE_BUCKET_NAME, AWS_PUBLIC_BUCKET_NAME, AWS_KEY, AWS_SECRET } from "$env/static/private";
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

export class S3Controller {
    #region;
    #fileUploadMaxSizeInBytes;
    #s3Client;
    constructor({ bucketName = undefined, fileUploadMaxSizeInBytes = 20 * 1024 * 1024 } = {}) {
        this.#region = "af-south-1";
        this.#fileUploadMaxSizeInBytes = fileUploadMaxSizeInBytes;

        this.bucketName = AWS_PRIVATE_BUCKET_NAME;
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
    getStaticBaseUrl({ containerIdentifier = undefined }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;
        return this.#getBaseUrlFromBucket({ bucketName: this.bucketName });
    }

    async uploadFile({ file, objectIdentifier, containerIdentifier = undefined, isPublic = undefined }) {
        if (containerIdentifier) this.bucketName = containerIdentifier;
        if (isPublic) this.bucketName = AWS_PUBLIC_BUCKET_NAME;

        let fileBuffer = file;
        if (file instanceof File) {
            fileBuffer = await file.arrayBuffer();
        }

        try {
            await this.#putObjectInBucket({
                bucketName: this.bucketName,
                objectKey: objectIdentifier,
                file: fileBuffer
            });
        } catch (error) {
            if (error?.Code === "NoSuchBucket") {
                await this.#createBucket(this.bucketName, isPublic);
                await this.uploadFile({ file, objectIdentifier, containerIdentifier, isPublic });
            }
        }
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

    async #createBucket(bucketName, isPublic) {
        if (!isPublic) {
            await this.#s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            return;
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
        return await this.#s3Client.send(new ListBucketsCommand({}));
    }

    async #putObjectInBucket({ bucketName, objectKey, file }) {
        if (bucketName) this.bucketName = bucketName;

        const commandOptions = { Bucket: bucketName, Key: objectKey, Body: file, ContentLength: Buffer.byteLength(file) };

        await this.#s3Client.send(new PutObjectCommand(commandOptions));
    }

    async #deleteObjectFromBucket(bucketName, objectKey) {
        if (bucketName) this.bucketName = bucketName;

        await this.#s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: objectKey }));
    }

    #getUrlFromBucketAndObjectKey({ bucketName, objectKey }) {
        if (!bucketName) bucketName = this.bucketName;

        return `https://${bucketName}.s3.${this.#region}.amazonaws.com/${objectKey}`;
    }

    #getBaseUrlFromBucket({ bucketName }) {
        return `https://${bucketName}.s3.${this.#region}.amazonaws.com/`;
    }
}
