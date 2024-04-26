import { AWS_BUCKET_NAME, CLOUD_STORAGE_PROVIDER, LOCAL_STORAGE_FOLDER_PATH } from "$env/static/private";
import { getGuid } from "$lib/server/helpers";
import { prisma } from "$lib/server/prisma-instance";
import { S3Controller } from "$lib/server/s3.helpers";
import { getFileExtension } from "../functions";
import { writeFileSync } from "fs";

export class UploadController {
    constructor() {
        this.saveLocally = LOCAL_STORAGE_FOLDER_PATH ? true : false;
        this.saveInCloud = false;

        switch (CLOUD_STORAGE_PROVIDER) {
            case "aws_s3":
                this.cloudController = new S3Controller();
                this.saveInCloud = true;
                break;
            default:
                console.log("Invalid cloud storage provider provided. Only aws_s3 supported for now");
                break;
        }
    }

    async uploadFiles({ files, linkedEntity, linkedEntityId, uploadType, sizeType, isPublic }) {
        if (files.length === 0) return [];

        const timeStampedFileNames = [];
        for (let i = 0; i < files.length; i++) {
            timeStampedFileNames[i] = `${new Date().getTime().toString()}_${files[i].name.replace(/[^a-z0-9+]+/gi, "_")}`;
        }

        if (this.saveLocally) {
            for (let i = 0; i < files.length; i++) {
                writeFileSync(`${LOCAL_STORAGE_FOLDER_PATH}/${timeStampedFileNames[i]}`, Buffer.from(await files[i].arrayBuffer()));
            }
        }

        if (this.saveInCloud) {
            for (let i = 0; i < files.length; i++) {
                await this.cloudController.uploadFile(files[i], timeStampedFileNames[i]);
            }
        }
        for (let i = 0; i < files.length; i++) {
            // TODO Write in one query
            await prisma.fileUpload.create({
                data: {
                    bucketName: AWS_BUCKET_NAME,
                    cloudStorageUniqueIdentifier: timeStampedFileNames[i],
                    displayName: files[i].name,
                    mimeType: files[i].type,
                    sizeInBytes: files[i].size,
                    uploadedFileExtension: getFileExtension(files.name),
                    finalFileUrl: this.#getUrlFromBucketAndObjectKey(AWS_BUCKET_NAME, objectKey),
                    publicFileUrl: null,
                    type: uploadType,
                    sizeType: sizeType,
                    linkedEntity,
                    linkedEntityId
                }
            });
        }

        console.log("final success");
        return filesInfoToReturn;
    }
}
