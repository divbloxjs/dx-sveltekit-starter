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

export class s3Controller {
    constructor(bucketName = undefined) {
        this.region = "af-south-1";
        this.fileUploadMaxSizeInBytes = 20 * 1024 * 1024;

        this.bucketName = AWS_BUCKET_NAME;
        if (bucketName) this.bucketName = bucketName;

        this.s3Client = new S3Client({
            region: this.region,
            credentials: { accessKeyId: AWS_KEY, secretAccessKey: AWS_SECRET }
        });
    }

    async uploadFile({ file, objectKey }) {
        const fileBuffer = await file.arrayBuffer();
        await this.#putObjectInBucket(AWS_BUCKET_NAME, fileBuffer, objectKey);
    }

    async #createBucket(bucketName) {
        await this.s3Client.send(
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
            const { Contents, IsTruncated, NextContinuationToken } = await this.s3Client.send(command);
            isTruncated = IsTruncated;
            if (!IsTruncated) break;
            objects.push(...Contents);
            command.input.ContinuationToken = NextContinuationToken;
        }

        return objects;
    }

    async #listBuckets() {
        try {
            const result = await this.s3Client.send(new ListBucketsCommand({}));
        } catch (err) {
            console.error(err);
        }
    }

    async #putObjectInBucket(bucketName, file, objectKey) {
        await this.s3Client.send(new PutObjectCommand({ Body: file, Bucket: bucketName, Key: objectKey }));
    }

    async #deleteObjectFromBucket(bucketName, objectKey) {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }));
    }

    #getUrlFromBucketAndObjectKey(bucketName, objectKey) {
        return `https://${bucketName}.s3.${this.region}.amazonaws.com/${objectKey}`;
    }

    async #createPresignedUrlForDownload({ bucketName, objectKey }) {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
        return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }

    async #createPresignedUrlForUpload({ bucketName, objectKey }) {
        const command = new PutObjectCommand({ Bucket: bucketName, Key: objectKey });
        return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }
}
