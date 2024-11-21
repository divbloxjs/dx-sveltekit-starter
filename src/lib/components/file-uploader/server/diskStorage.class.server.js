export class diskStorage {
    async upload() {}
    async uploadMany() {}
    async download() {}
    async delete() {}
}

import { env } from "$env/dynamic/private";
import { AwsStorage } from "./awsStorage.class.server";
import { getFileExtension, getFileNameWithoutExtension, insertBeforeFileExtension } from "../functions";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import sharp from "sharp";
import imageType from "image-type";
import { existsSync } from "fs";

export class FileController {
    #uploadFolder;
    constructor({ uploadFolder = env.LOCAL_STORAGE_FOLDER_PATH ?? "/uploads" }) {
        this.#uploadFolder = uploadFolder;
    }

    async uploadFiles({
        files,
        linked_entity,
        linked_entity_id,
        category,
        createThumbnailAndWebImages = false,
        cloud_is_publicly_available = false
    }) {
        if (files.length === 0) return [];

        const filesToUpload = [];
        for (let i = 0; i < files.length; i++) {
            const arrayBuffer = await files[i].arrayBuffer();
            const timestamp = new Date().getTime().toString();

            const timestampedFileName = insertBeforeFileExtension(files[i].name, `_${timestamp}`);
            const formattedTimestampedFileName = `${getFileNameWithoutExtension(timestampedFileName).replace(/[^a-z0-9+]+/gi, "_")}.${getFileExtension(timestampedFileName)}`;

            filesToUpload.push({
                isImage: false,
                object_identifier: formattedTimestampedFileName,
                sizes_saved: {
                    original: {
                        fileArrayBuffer: arrayBuffer,
                        object_identifier: `original_${formattedTimestampedFileName}`
                    }
                }
            });

            if (!createThumbnailAndWebImages) continue;

            const isImage = await imageType(filesToUpload[i].sizes_saved.original.fileArrayBuffer);

            if (!isImage) continue;

            filesToUpload[i].isImage = true;

            const { original, web, thumbnail } = await this.getAllImageBuffers(filesToUpload[i].sizes_saved.original.fileArrayBuffer);

            filesToUpload[i].sizes_saved.original = {
                fileArrayBuffer: original,
                object_identifier: `original_${formattedTimestampedFileName}`
            };
            filesToUpload[i].sizes_saved.web = { fileArrayBuffer: web, object_identifier: `web_${formattedTimestampedFileName}` };
            filesToUpload[i].sizes_saved.thumbnail = {
                fileArrayBuffer: thumbnail,
                object_identifier: `thumbnail_${formattedTimestampedFileName}`
            };
        }

        let staticFileUrls = [];
        for (let i = 0; i < filesToUpload.length; i++) {
            staticFileUrls[i] = {};
            for (let [sizeType, { fileArrayBuffer, object_identifier }] of Object.entries(filesToUpload[i].sizes_saved)) {
                const localStaticFilePath = `${this.#uploadFolder}/${object_identifier}`;

                if (!existsSync(this.#uploadFolder)) {
                    mkdirSync(this.#uploadFolder);
                }
                writeFileSync(localStaticFilePath, Buffer.from(fileArrayBuffer));
                staticFileUrls[i][sizeType] = localStaticFilePath;
            }
        }

        const filesDataToReturn = [];
        let fileToCreateArray = [];
        for (let i = 0; i < files.length; i++) {
            const data = {
                mime_type: files[i].type,
                original_size_in_bytes: files[i].size,
                uploaded_file_extension: getFileExtension(files[i].name),

                category,
                linked_entity,
                linked_entity_id,
                object_identifier: filesToUpload[i].object_identifier,

                display_name: files[i].name,
                sizes_saved: [],
                base_file_url: env.LOCAL_STORAGE_FOLDER_PATH
            };

            if (this.#saveInCloud) {
                data.cloud_is_publicly_available = cloud_is_publicly_available;

                data.cloud_container_identifier = this.#cloudController.getContainerIdentifier();

                data.base_file_url = this.#cloudController.getStaticBaseUrl({
                    container_identifier: data.cloud_container_identifier
                });
            }

            for (let [sizeType, { fileArrayBuffer, object_identifier }] of Object.entries(filesToUpload[i].sizes_saved)) {
                data.sizes_saved.push(sizeType);
            }

            fileToCreateArray.push(data);

            const urls = {};
            urls.original = await this.getUrlForDownload({
                container_identifier: data.cloud_container_identifier,
                object_identifier: `original_${data.object_identifier}`,
                cloud_is_publicly_available
            });

            if ((filesToUpload[i].isImage = true)) {
                urls.thumbnail = await this.getUrlForDownload({
                    container_identifier: data.cloud_container_identifier,
                    object_identifier: `thumbnail_${data.object_identifier}`
                });

                urls.web = await this.getUrlForDownload({
                    container_identifier: data.cloud_container_identifier,
                    object_identifier: `web_${data.object_identifier}`
                });
            }

            const file = {
                urls,
                object_identifier: data.object_identifier,
                sizes_saved: data.sizes_saved,
                linked_entity: data.linked_entity,
                linked_entity_id: data.linked_entity_id?.toString(),
                mime_type: data.mime_type,
                original_size_in_bytes: data.original_size_in_bytes,
                uploaded_file_extension: getFileExtension(data.display_name),
                display_name: data.display_name
            };

            filesDataToReturn.push(file);
        }

        return fileToCreateArray;
    }

    async deleteFile({ container_identifier, object_identifier }) {
        if (this.#saveLocally) {
            //DELETE file locally
            const localStaticFilePath = `${env.LOCAL_STORAGE_FOLDER_PATH}/${object_identifier}`;
            unlinkSync(localStaticFilePath);
        }

        if (this.#saveInCloud && container_identifier) {
            await this.#cloudController?.deleteFile({
                container_identifier,
                object_identifier
            });
        }
    }

    async getUrlForDownload({ container_identifier, object_identifier, cloud_is_publicly_available = false }) {
        if (this.#saveLocally) return `${env.LOCAL_STORAGE_FOLDER_PATH}/${object_identifier}`;

        if (cloud_is_publicly_available) {
            return this.#cloudController?.getStaticUrl({ container_identifier, object_identifier: `public/${object_identifier}` });
        }

        return this.#cloudController?.getPresignedUrlForDownload({ container_identifier, object_identifier });
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
