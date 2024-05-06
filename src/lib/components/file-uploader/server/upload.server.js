import { AWS_BUCKET_NAME, CLOUD_STORAGE_PROVIDER, LOCAL_STORAGE_FOLDER_PATH } from "$env/static/private";
import { getGuid } from "$lib/server/helpers";
import { prisma } from "$lib/server/prisma-instance";
import { S3Controller } from "./s3.server";
import { getFileExtension, insertBeforeFileExtension } from "../functions";
import { writeFileSync } from "fs";

export class UploadController {
    #saveLocally;
    #saveInCloud;
    #cloudController;

    constructor({ saveLocally = LOCAL_STORAGE_FOLDER_PATH ? true : false, saveInCloud = false }) {
        this.#saveLocally = saveLocally;
        if (saveInCloud) this.#saveInCloud = saveInCloud;

        switch (CLOUD_STORAGE_PROVIDER) {
            case "aws_s3":
                this.#cloudController = new S3Controller();
                this.#saveInCloud = true;
                break;
            default:
                console.log("Invalid cloud storage provider provided. Only aws_s3 supported for now");
                break;
        }
    }

    async uploadFiles({
        files,
        linkedEntity,
        linkedEntityId,
        category,
        sizeClassification = "original",
        cloudIsPubliclyAvailable = false
    }) {
        if (files.length === 0) return [];

        const finalFileNames = [];
        for (let i = 0; i < files.length; i++) {
            const timestampedFileName = insertBeforeFileExtension(
                files[i].name.replace(/[^a-z0-9+]+/gi, "_"),
                `_${new Date().getTime().toString()}`
            );
            finalFileNames[i] = `${sizeClassification}/${timestampedFileName}`;
        }

        let localStaticFileUrls = [];
        if (this.#saveLocally) {
            for (let i = 0; i < files.length; i++) {
                const localStaticFilePath = `${LOCAL_STORAGE_FOLDER_PATH}/${finalFileNames[i]}`;
                writeFileSync(localStaticFilePath, Buffer.from(await files[i].arrayBuffer()));
                localStaticFileUrls[i] = localStaticFilePath;
            }
        }

        if (this.#saveInCloud) {
            for (let i = 0; i < files.length; i++) {
                if (cloudIsPubliclyAvailable) {
                    finalFileNames[i] = `public/${finalFileNames[i]}`;
                }

                await this.#cloudController.uploadFile({ file: files[i], objectIdentifier: finalFileNames[i] });
            }
        }

        const filesDataToReturn = [];
        for (let i = 0; i < files.length; i++) {
            // TODO Write in one query
            const data = {
                category,
                sizeClassification,
                linkedEntity,
                linkedEntityId,
                displayName: files[i].name,
                mimeType: files[i].type,
                sizeInBytes: files[i].size,
                uploadedFileExtension: getFileExtension(files[i].name),
                staticFileUrl: localStaticFileUrls[i]
            };

            if (this.#saveInCloud) {
                data.cloudIsPubliclyAvailable = cloudIsPubliclyAvailable;

                data.cloudContainerIdentifier = this.#cloudController.getContainerIdentifier();
                data.objectIdentifier = finalFileNames[i];

                data.staticFileUrl = this.#cloudController.getStaticUrl({
                    containerIdentifier: data.cloudContainerIdentifier,
                    objectIdentifier: data.objectIdentifier
                });
            }

            await prisma.fileUpload.create({ data });

            filesDataToReturn.push(data);
        }

        return filesDataToReturn;
    }

    async getUrlForDownload({ containerIdentifier, objectIdentifier }) {
        if (this.#saveLocally) return `${LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;

        return this.#cloudController?.getPresignedUrlForDownload({ containerIdentifier, objectIdentifier });
    }

    async getUrlForUpload() {}
}
