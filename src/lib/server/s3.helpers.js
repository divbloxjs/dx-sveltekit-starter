import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    ListBucketsCommand
} from "@aws-sdk/client-s3";

export class S3Controller {
    constructor() {
        this.region = "af-south-1";
        this.s3Client = new S3Client({
            region: this.region,
            credentials: { accessKeyId: "AKIATCKARLFLRJTJG2PW", secretAccessKey: "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" }
        });

        this.uploadPath = "/static";
        this.fileUploadMaxSizeInBytes = 20 * 1024 * 1024;
    }

    async createBucket(bucketName) {
        try {
            const result = await this.s3Client.send(
                new CreateBucketCommand({
                    Bucket: bucketName
                })
            );
        } catch (err) {
            console.error(err);
        }
    }

    async listObjectsInBucket(bucketName) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            // The default and maximum number of keys returned is 1000. This limits it to
            // one for demonstration purposes.
            MaxKeys: 100
        });

        try {
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
        } catch (err) {
            console.error(err);
        }

        return null;
    }

    async listBuckets() {
        try {
            const result = await this.s3Client.send(new ListBucketsCommand({}));
        } catch (err) {
            console.error(err);
        }
    }

    async putObjectInBucket(bucketName, file, objectKey) {
        try {
            const result = await this.s3Client.send(new PutObjectCommand({ Body: file, Bucket: bucketName, Key: objectKey }));
        } catch (err) {
            console.error(err);
        }
    }

    async deleteObjectFromBucket(bucketName, objectKey) {
        try {
            const result = await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }));
        } catch (err) {
            console.error(err);
        }
    }

    getUrlFromBucketAndObjectKey(bucketName, objectKey) {
        return `https://${bucketName}.s3.${this.region}.amazonaws.com/${objectKey}`;
    }

    createPresignedUrl({ bucket, key }) {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    }
}
