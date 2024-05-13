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
        createThumbnailAndWebImages = false,
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
                objectIdentifier: formattedTimestampedFileName,
                sizesSaved: {
                    original: {
                        fileArrayBuffer: arrayBuffer,
                        objectIdentifier: `original_${formattedTimestampedFileName}`
                    }
                }
            });

            if (!createThumbnailAndWebImages) continue;

            const isImage = await imageType(filesToUpload[i].sizesSaved.original.fileArrayBuffer);

            if (!isImage) continue;

            filesToUpload[i].isImage = true;

            const { original, web, thumbnail } = await this.getAllImageBuffers(filesToUpload[i].sizesSaved.original.fileArrayBuffer);

            filesToUpload[i].sizesSaved.original = {
                fileArrayBuffer: original,
                objectIdentifier: `original_${formattedTimestampedFileName}`
            };
            filesToUpload[i].sizesSaved.web = { fileArrayBuffer: web, objectIdentifier: `web_${formattedTimestampedFileName}` };
            filesToUpload[i].sizesSaved.thumbnail = {
                fileArrayBuffer: thumbnail,
                objectIdentifier: `thumbnail_${formattedTimestampedFileName}`
            };
        }

        let localStaticFileUrls = [];
        if (this.#saveLocally) {
            for (let i = 0; i < filesToUpload.length; i++) {
                localStaticFileUrls[i] = {};
                for (let [sizeType, { fileArrayBuffer, objectIdentifier }] of Object.entries(filesToUpload[i].sizesSaved)) {
                    const localStaticFilePath = `${LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;
                    writeFileSync(localStaticFilePath, fileArrayBuffer);
                    localStaticFileUrls[i][sizeType] = localStaticFilePath;
                }
            }
        }

        if (this.#saveInCloud) {
            for (let i = 0; i < filesToUpload.length; i++) {
                for (let [sizeType, { fileArrayBuffer, objectIdentifier }] of Object.entries(filesToUpload[i].sizesSaved)) {
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
            const data = {
                mimeType: files[i].type,
                originalSizeInBytes: files[i].size,
                uploadedFileExtension: getFileExtension(files[i].name),

                category,
                linkedEntity,
                linkedEntityId,
                objectIdentifier: filesToUpload[i].objectIdentifier,

                displayName: files[i].name,
                sizesSaved: [],
                baseFileUrl: LOCAL_STORAGE_FOLDER_PATH
            };

            if (this.#saveInCloud) {
                data.cloudIsPubliclyAvailable = cloudIsPubliclyAvailable;

                data.cloudContainerIdentifier = this.#cloudController.getContainerIdentifier();

                data.baseFileUrl = this.#cloudController.getStaticBaseUrl({
                    containerIdentifier: data.cloudContainerIdentifier
                });
            }

            for (let [sizeType, { fileArrayBuffer, objectIdentifier }] of Object.entries(filesToUpload[i].sizesSaved)) {
                data.sizesSaved.push(sizeType);
            }

            fileUploadToCreateArray.push(data);

            const urls = {};
            urls.original = await this.getUrlForDownload({
                containerIdentifier: data.cloudContainerIdentifier,
                objectIdentifier: `original_${data.objectIdentifier}`
            });

            if ((filesToUpload[i].isImage = true)) {
                urls.thumbnail = await this.getUrlForDownload({
                    containerIdentifier: data.cloudContainerIdentifier,
                    objectIdentifier: `thumbnail_${data.objectIdentifier}`
                });

                urls.web = await this.getUrlForDownload({
                    containerIdentifier: data.cloudContainerIdentifier,
                    objectIdentifier: `web_${data.objectIdentifier}`
                });
            }

            const file = {
                urls,
                webUrl: null,
                thumbnailUrl: null,
                objectIdentifier: data.objectIdentifier,
                sizesSaved: data.sizesSaved,
                linkedEntity: data.linkedEntity,
                linkedEntityId: data.linkedEntityId?.toString(),
                mimeType: data.mimeType,
                originalSizeInBytes: data.originalSizeInBytes,
                uploadedFileExtension: getFileExtension(data.displayName),
                displayName: data.displayName
            };

            filesDataToReturn.push(file);
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
