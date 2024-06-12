import { env } from "$env/dynamic/private";
import { S3Controller } from "./s3.server";
import { getFileExtension, getFileWithoutExtension, insertBeforeFileExtension } from "../functions";
import { mkdirSync, writeFileSync } from "fs";
import sharp from "sharp";
import imageType from "image-type";
import { existsSync } from "fs";

export class FileController {
    #saveLocally;
    #saveInCloud;
    #cloudController;

    constructor({
        saveLocally = env.STORE_FILES_LOCALLY.toLowerCase() === "true" ? true : false,
        saveInCloud = env.STORE_FILES_IN_CLOUD.toLowerCase() === "true" ? true : false
    } = {}) {
        if (saveLocally) this.#saveLocally = saveLocally;
        if (saveInCloud) this.#saveInCloud = saveInCloud;

        switch (env.CLOUD_STORAGE_PROVIDER) {
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
                    const localStaticFilePath = `${env.LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;

                    if (!existsSync(env.LOCAL_STORAGE_FOLDER_PATH)) {
                        mkdirSync(env.LOCAL_STORAGE_FOLDER_PATH);
                    }
                    writeFileSync(localStaticFilePath, Buffer.from(fileArrayBuffer));
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

                    await this.#cloudController.uploadFile({ file: fileArrayBuffer, objectIdentifier, isPublic: cloudIsPubliclyAvailable });
                }
            }
        }

        const filesDataToReturn = [];
        let fileToCreateArray = [];
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
                baseFileUrl: env.LOCAL_STORAGE_FOLDER_PATH
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

            fileToCreateArray.push(data);

            const urls = {};
            urls.original = await this.getUrlForDownload({
                containerIdentifier: data.cloudContainerIdentifier,
                objectIdentifier: `original_${data.objectIdentifier}`,
                isPublic: cloudIsPubliclyAvailable
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

        return fileToCreateArray;
    }

    async deleteFile({ containerIdentifier, objectIdentifier }) {
        await this.#cloudController.deleteFile({
            containerIdentifier,
            objectIdentifier
        });
    }

    async getUrlForDownload({ containerIdentifier, objectIdentifier, cloudIsPubliclyAvailable = false }) {
        if (this.#saveLocally) return `${env.LOCAL_STORAGE_FOLDER_PATH}/${objectIdentifier}`;

        if (cloudIsPubliclyAvailable) {
            return this.#cloudController?.getStaticUrl({ containerIdentifier, objectIdentifier: `public/${objectIdentifier}` });
        }

        return this.#cloudController?.getPresignedUrlForDownload({ containerIdentifier, objectIdentifier });
    }

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
