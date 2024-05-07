import { AWS_BUCKET_NAME, CLOUD_STORAGE_PROVIDER, LOCAL_STORAGE_FOLDER_PATH } from "$env/static/private";
import { getGuid } from "$lib/server/helpers";
import { prisma } from "$lib/server/prisma-instance";
import { S3Controller } from "./s3.server";
import { getFileExtension, getFileWithoutExtension, insertBeforeFileExtension } from "../functions";
import { writeFileSync } from "fs";
import sharp from "sharp";
import imageType, { minimumBytes } from "image-type";

export class UploadController {
    #saveLocally;
    #saveInCloud;
    #cloudController;

    constructor({ saveLocally = LOCAL_STORAGE_FOLDER_PATH ? true : false, saveInCloud = false } = {}) {
        if (saveLocally) this.#saveLocally = saveLocally;
        if (saveInCloud) this.#saveInCloud = saveInCloud;

        switch (CLOUD_STORAGE_PROVIDER) {
            case "aws_s3":
                this.#cloudController = new S3Controller();
                this.#saveInCloud = true;
                break;
            default:
                console.log("Invalid cloud storage provider provided. Only aws_s3 supported");
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

        const filesToUpload = [];
        for (let i = 0; i < files.length; i++) {
            const arrayBuffer = await files[i].arrayBuffer();
            const timestamp = new Date().getTime().toString();

            const timestampedFileName = insertBeforeFileExtension(files[i].name, `_${timestamp}`);
            const formattedTimestampedFileName = `${getFileWithoutExtension(timestampedFileName).replace(/[^a-z0-9+]+/gi, "_")}.${getFileExtension(timestampedFileName)}`;

            filesToUpload.push({
                isImage: false,
                sizeClassifications: {
                    [sizeClassification]: {
                        fileArrayBuffer: arrayBuffer,
                        objectIdentifier: formattedTimestampedFileName
                    }
                }
            });

            const isImage = await imageType(filesToUpload[i].sizeClassifications[sizeClassification].fileArrayBuffer);
            if (isImage) {
                filesToUpload[i].isImage = true;

                const { original, web, thumbnail } = await this.getAllImageBuffers(
                    filesToUpload[i].sizeClassifications.original.fileArrayBuffer
                );

                filesToUpload[i].sizeClassifications.original = {
                    fileArrayBuffer: original,
                    objectIdentifier: formattedTimestampedFileName
                };
                filesToUpload[i].sizeClassifications.web = { fileArrayBuffer: web, objectIdentifier: formattedTimestampedFileName };
                filesToUpload[i].sizeClassifications.thumbnail = {
                    fileArrayBuffer: thumbnail,
                    objectIdentifier: formattedTimestampedFileName
                };
            }
        }

        let localStaticFileUrls = [];
        if (this.#saveLocally) {
            for (let i = 0; i < filesToUpload.length; i++) {
                localStaticFileUrls[i] = {};
                for (let [sizeClassification, { fileArrayBuffer, objectIdentifier }] of Object.entries(
                    filesToUpload[i].sizeClassifications
                )) {
                    const localStaticFilePath = `${LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;
                    writeFileSync(localStaticFilePath, fileArrayBuffer);
                    localStaticFileUrls[i][sizeClassification] = localStaticFilePath;
                }
            }
        }

        if (this.#saveInCloud) {
            for (let i = 0; i < filesToUpload.length; i++) {
                for (let [sizeClassification, { fileArrayBuffer, objectIdentifier }] of Object.entries(
                    filesToUpload[i].sizeClassifications
                )) {
                    if (cloudIsPubliclyAvailable) {
                        objectIdentifier = `public/${objectIdentifier}`;
                    }

                    await this.#cloudController.uploadFile({ file: fileArrayBuffer, objectIdentifier });
                }
            }
        }

        const filesDataToReturn = [];
        let fileUploadToCreateArray = [];
        for (let i = 0; i < files.length; i++) {
            for (let [sizeClassification, { fileArrayBuffer, objectIdentifier }] of Object.entries(filesToUpload[i].sizeClassifications)) {
                const data = {
                    category,
                    sizeClassification,
                    linkedEntity,
                    linkedEntityId,
                    objectIdentifier,
                    displayName: files[i].name,
                    mimeType: files[i].type,
                    sizeInBytes: files[i].size,
                    uploadedFileExtension: getFileExtension(files[i].name),
                    staticFileUrl: localStaticFileUrls?.[i]?.[sizeClassification]
                };

                if (this.#saveInCloud) {
                    data.cloudIsPubliclyAvailable = cloudIsPubliclyAvailable;

                    data.cloudContainerIdentifier = this.#cloudController.getContainerIdentifier();

                    data.staticFileUrl = this.#cloudController.getStaticUrl({
                        containerIdentifier: data.cloudContainerIdentifier,
                        objectIdentifier: data.objectIdentifier
                    });
                }

                fileUploadToCreateArray.push(data);

                filesDataToReturn.push({
                    ...filesToUpload[i].sizeClassifications
                });
            }
        }

        await prisma.fileUpload.createMany({ data: fileUploadToCreateArray });

        return filesDataToReturn;
    }

    async deleteFile({ containerIdentifier, objectIdentifier }) {
        const fileUploads = await prisma.fileUpload.findMany({ where: { objectIdentifier } });

        for (let fileUpload of fileUploads) {
            await this.#cloudController.deleteFile({
                containerIdentifier,
                objectIdentifier: `${fileUpload.sizeClassification}/${fileUpload.objectIdentifier}`
            });
        }
    }

    async getUrlForDownload({ containerIdentifier, objectIdentifier }) {
        if (this.#saveLocally) return `${LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;

        return this.#cloudController?.getPresignedUrlForDownload({ containerIdentifier, objectIdentifier });
    }

    async getUrlForUpload() {}

    async getAllImageBuffers(imageArrayBuffer) {
        const returnImageBuffers = {};
        const { width, height } = await sharp(imageArrayBuffer).metadata();

        returnImageBuffers["original"] = imageArrayBuffer;

        for (const size of [
            { type: "web", maxDimension: 1080 },
            { type: "thumbnail", maxDimension: 150 }
        ]) {
            const webSharpOptions = {
                fit: sharp.fit.contain
            };

            const uploadedImageMaxDimension = Math.max(width, height);
            if (width > height) {
                webSharpOptions.width = uploadedImageMaxDimension > size.maxDimension ? size.maxDimension : width;
            } else {
                webSharpOptions.height = uploadedImageMaxDimension > size.maxDimension ? size.maxDimension : height;
            }

            const newImageBuffer = await sharp(imageArrayBuffer).resize(webSharpOptions).toBuffer();
            returnImageBuffers[size.type] = newImageBuffer;
        }

        return returnImageBuffers;
    }
}
