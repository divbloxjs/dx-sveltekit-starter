import { env } from "$env/dynamic/private";
import { getFileExtension, getFileNameWithoutExtension, insertBeforeFileExtension } from "./functions";
import sharp from "sharp";
import imageType from "image-type";
import { AwsStorage } from "./awsStorage.class.server";
import { prisma } from "../prisma-instance";
import { getCompression } from "$lib/server/compression/compression.factory.class.server.js";

export class UploadController {
    /** @type {AwsStorage} storage */
    #storage;

    #thumbnailPrefix = "thumbnail/";
    #webPrefix = "web/";
    #originalPrefix = "original/";

    /** @param {AwsStorage} storage */
    constructor(storage) {
        this.#storage = storage;
    }

    /**
     *
     * @param {Object} params
     * @param {File[]} params.files
     * @param {string} params.linked_entity
     * @param {number} params.linked_entity_id
     * @param {string} params.category
     * @param {boolean} params.createThumbnailAndWebImages
     * @param {boolean} params.cloud_is_publicly_available
     * @returns
     */
    async uploadFiles({
        files,
        linked_entity,
        linked_entity_id,
        category,
        createThumbnailAndWebImages = false,
        cloud_is_publicly_available = false
    }) {
        if (files?.length === 0) return [];

        const filesToUpload = [];
        for (let i = 0; i < files.length; i++) {
            const arrayBuffer = await files[i].arrayBuffer();

            const timestamp = new Date().getTime().toString();
            const timestampedFileName = insertBeforeFileExtension(files[i].name, `_${timestamp}`);
            const formattedTimestampedFileName = `${getFileNameWithoutExtension(timestampedFileName).replace(/[^a-z0-9+]+/gi, "_")}.${getFileExtension(timestampedFileName)}`;

            // filesToUpload.push({
            //     isImage: false,
            //     object_identifier: formattedTimestampedFileName,
            //     sizes_saved: {
            //         original: {
            //             fileArrayBuffer: arrayBuffer,
            //             object_identifier: `original_${formattedTimestampedFileName}`
            //         }
            //     }
            // });

            const isImage = await imageType(arrayBuffer);

            let configuration = {};
            if (isImage) {
                configuration = { original: { maxDimension: 2500 }, };
                if (createThumbnailAndWebImages) {
                    configuration.web =  { maxDimension: 1080 };
                    configuration.thumbnail =  { maxDimension: 1080 }
                }
            }

            const compression = getCompression({ fileType: isImage ? "image" : "file" }, configuration);

            const files = await compression.getAllFiles(arrayBuffer);

            for (const [size, file] of files) {
                const object_identifier = `${size}_${formattedTimestampedFileName}`;
                filesToUpload[i].sizes_saved[size] = { file, object_identifier };

                const uploadParams = { file, object_identifier };
                if (cloud_is_publicly_available) uploadParams.isPublic = true;
                await this.#storage.uploadFile(uploadParams);

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

                    data.cloud_is_publicly_available = cloud_is_publicly_available;

                    data.base_file_url = this.#storage.getStaticBaseUrl({
                        container_identifier: data.cloud_container_identifier
                    });

                    for (let [sizeType, {
                        fileArrayBuffer,
                        object_identifier
                    }] of Object.entries(filesToUpload[i].sizes_saved)) {
                        data.sizes_saved.push(sizeType);
                    }

                    fileToCreateArray.push(data);

                    const urls = {};
                    urls.original = await this.#storage.getUrlForDownload({
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

            data.cloud_is_publicly_available = cloud_is_publicly_available;

            // data.cloud_container_identifier = this.#storage.containerIdentifier;
            data.base_file_url = this.#storage.getStaticBaseUrl({
                container_identifier: data.cloud_container_identifier
            });

            for (let [sizeType, { fileArrayBuffer, object_identifier }] of Object.entries(filesToUpload[i].sizes_saved)) {
                data.sizes_saved.push(sizeType);
            }

            fileToCreateArray.push(data);

            const urls = {};
            urls.original = await this.#storage.getUrlForDownload({
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

    async deleteFile({ object_identifier }) {
        const file = await prisma.file.findFirst({ where: { object_identifier } });
        if (!file) return;

        try {
            for (let sizeType of file?.sizes_saved ?? []) {
                let finalObjectIdentifier = `${sizeType}_${file.object_identifier}`;
                let containerIdentifier = env.AWS_PRIVATE_BUCKET_NAME;
                if (file?.cloud_is_publicly_available) {
                    finalObjectIdentifier = `public/${finalObjectIdentifier}`;
                    containerIdentifier = env.AWS_PUBLIC_BUCKET_NAME;
                }

                const result = this.#storage.deleteFile({ object_identifier: finalObjectIdentifier, containerIdentifier });
            }
        } catch (err) {
            console.error(err);
            return fail(400);
        }

        await prisma.file.delete({ where: { id: file.id } });
        return json({ message: "Deleted successfully!" });
    }

    async deleteFiles({ object_identifiers = [] }) {
        try {
            for (const file of files) {
                for (let sizeType of file?.sizes_saved ?? []) {
                    let finalObjectIdentifier = `${sizeType}_${file.object_identifier}`;
                    let containerIdentifier = env.AWS_PRIVATE_BUCKET_NAME;
                    if (file?.cloudIsPubliclyAvailable) {
                        finalObjectIdentifier = `public/${finalObjectIdentifier}`;
                        containerIdentifier = env.AWS_PUBLIC_BUCKET_NAME;
                    }

                    const result = this.#storage.deleteFile({ object_identifier: finalObjectIdentifier, containerIdentifier });
                    await prisma.file.delete({ where: { id: file.id } });
                }
            }
        } catch (err) {
            console.error(err);
            return fail(400);
        }

        await prisma.file.deleteMany({ where: { id: { in: files.map((file) => file.id) } } });
    }

    /**
     * @typedef {Object} imagesReturn
     * @property {Buffer} original
     * @property {Buffer} web
     * @property {Buffer} thumbnail
     */

    /**
     *
     * @param {Object} imageArrayBuffer
     * @returns {Promise<imagesReturn>}
     */
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
