import { getFileExtension, getFileNameWithoutExtension, insertBeforeFileExtension } from "./functions";
import imageType from "image-type";
import { StorageBase, StorageResult } from "./storage.class.js";
import { prisma } from "../prisma-instance";
import { getCompression } from "$lib/server/compression/compression.factory.class.server.js";
import { AwsStorage } from "./awsStorage.class.server";

export class FileManager {
    static configuredCategories = {
        profilePicture: "Profile Picture"
    };
    /** @type {AwsStorage} storage */
    #storage;

    /**
     * @param {AwsStorage} storage
     */
    constructor(storage) {
        this.#storage = storage;
    }
    /**
     * @param {Object} params
     * @param {File} params.file
     * @param {string} params.linked_entity
     * @param {number} params.linked_entity_id
     * @param {string} params.category
     * @param {boolean} [params.createThumbnailAndWebImages]
     * @param {boolean} [params.is_public]
     * @returns {Promise<{ok: boolean, error?: any, file?: import("@prisma/client").Prisma.fileCreateInput}>}
     */
    async uploadFile({ file, linked_entity, linked_entity_id, category, createThumbnailAndWebImages = false, is_public = false }) {
        const base_object_identifier = this.#generateObjectIdentifier(file.name);
        const arrayBuffer = await file.arrayBuffer();
        const isImage = await imageType(arrayBuffer);

        /** @type {import("@prisma/client").Prisma.fileCreateInput} */
        const fileData = {
            object_identifier: base_object_identifier,
            sizes_saved: [],
            file_type: isImage ? "image" : "file",
            mime_type: file.type,
            original_size_in_bytes: file.size,
            uploaded_file_extension: getFileExtension(file.name),

            category,
            linked_entity,
            linked_entity_id,

            display_name: file.name,
            base_file_url: this.#storage.getStaticBaseUrl(),
            container_identifier: this.#storage.containerIdentifier,
            is_public,
            storage_provider: this.#storage.storageProvider
        };

        let configuration = {};
        if (isImage) {
            configuration.original = { maxDimension: 2500 };
            if (createThumbnailAndWebImages) {
                configuration.web = { maxDimension: 1080 };
                configuration.thumbnail = { maxDimension: 1080 };
            }
        }

        const compression = getCompression({ fileType: isImage ? "image" : "file" }, configuration);

        const fileSet = await compression.getFinalFileSet(arrayBuffer);

        for (const [size, file] of Object.entries(fileSet)) {
            const object_identifier = `${size}_${base_object_identifier}`;

            if (!fileData.sizes_saved) fileData.sizes_saved = [];
            fileData.sizes_saved.push(size);

            const result = await this.#storage.uploadFile({ file, object_identifier });

            if (!result.ok) {
                return StorageResult.err({ error: result.error });
            }
        }

        return StorageResult.ok({ file: fileData });
    }

    /**
     *
     * @param {Object} params
     * @param {File[]} params.files
     * @param {string} params.linked_entity
     * @param {number} params.linked_entity_id
     * @param {string} params.category
     * @param {boolean} [params.createThumbnailAndWebImages]
     * @param {boolean} [params.is_public]
     * @returns {Promise<{ok: boolean, error?: any, files?: import("@prisma/client").Prisma.fileCreateInput[]}>}
     */
    async uploadFiles({ files, linked_entity, linked_entity_id, category, createThumbnailAndWebImages = false, is_public = false }) {
        if (files?.length === 0) return StorageResult.err("No files provided");

        const uploadedFiles = [];
        for (const [index, file] of files.entries()) {
            const result = await this.uploadFile({
                file,
                linked_entity,
                linked_entity_id,
                category,
                createThumbnailAndWebImages,
                is_public
            });

            if (!result.ok) {
                return StorageResult.err({ error: result.error });
            }

            uploadedFiles[index] = result.file;
        }

        await prisma.file.createMany({ data: uploadedFiles });

        return StorageResult.ok({ files: uploadedFiles });
    }

    //#region Delete

    /**
     * @param {import("@prisma/client").file} file
     * @returns {Promise<{ok: boolean, error?: any}>}
     */
    async deleteFile(file) {
        try {
            for (let size of file?.sizes_saved ?? []) {
                const result = await this.#storage.deleteFile({
                    object_identifier: `${size}_${file.object_identifier}`,
                    container_identifier: file.container_identifier
                });

                console.log("result", result);
            }
        } catch (error) {
            return StorageResult.err({ error });
        }

        await prisma.file.delete({ where: { id: file.id } });

        return StorageResult.ok();
    }

    /**
     * NOT Optimised for bulk
     * @param {import("@prisma/client").file[]} files
     * @returns {Promise<{ok: boolean, error?: any}>}
     */
    async deleteFiles(files = []) {
        let errors = [];
        try {
            for (const file of files) {
                for (let sizeType of file?.sizes_saved ?? []) {
                    let object_identifier = `${sizeType}_${file.object_identifier}`;
                    const storageResult = await this.#storage.deleteFile({ object_identifier });
                    if (!storageResult.ok) {
                        errors.push({ id: file.id, object_identifier, error: storageResult.error });
                        continue;
                    }
                }

                if (errors.length > 0) {
                    StorageResult.err({ message: "Some files could not be deleted", errors });
                }

                await prisma.file.delete({ where: { id: file.id } });
            }
        } catch (error) {
            StorageResult.err({ error });
        }

        if (errors.length > 0) {
            StorageResult.err({ message: "Some files could not be deleted", errors });
        }

        return StorageResult.ok();
    }
    /**
     * @param {string} object_identifier
     * @returns {Promise<{ok: boolean, error?: any}>}
     */
    async deleteFileByObjectIdentifier(object_identifier) {
        const file = await prisma.file.findUnique({ where: { object_identifier } });
        if (!file) StorageResult.err(`No file found for object_identifier: ${object_identifier}`);

        let errors = {};
        for (let size of file?.sizes_saved ?? []) {
            try {
                const result = await this.#storage.deleteFile({
                    object_identifier: `${size}_${file?.object_identifier}`,
                    container_identifier: file?.container_identifier
                });

                if (!result.ok) {
                    errors[size] = result.error;
                }
            } catch (error) {
                return StorageResult.err({ error });
            }
        }

        if (Object.keys(errors).length > 0) {
            return StorageResult.err({ error: { message: "Could not delete certain file sizes", errors } });
        }

        await prisma.file.delete({ where: { id: file?.id } });

        return StorageResult.ok();
    }

    /**
     * @param {number} id
     * @returns {Promise<{ok: boolean, error?: any}>}
     */
    async deleteFileById(id) {
        const file = await prisma.file.findUnique({ where: { id } });
        if (!file) StorageResult.err(`No file found for ID: ${id}`);

        try {
            for (let size of file?.sizes_saved ?? []) {
                const result = await this.#storage.deleteFile({
                    object_identifier: `${size}_${file?.object_identifier}`,
                    container_identifier: file?.container_identifier
                });

                console.log("result", result);
            }
        } catch (error) {
            return StorageResult.err({ error });
        }

        await prisma.file.delete({ where: { id } });

        return StorageResult.ok();
    }

    //#endregion

    /**
     * Helper function to generate the unique timestamped file/object identifier
     * @param {string} initialFileName
     * @returns {string}
     */
    #generateObjectIdentifier(initialFileName) {
        const timestamp = new Date().getTime().toString();
        const timestampedFileName = insertBeforeFileExtension(initialFileName, `_${timestamp}`);
        const formattedTimestampedFileName = `${getFileNameWithoutExtension(timestampedFileName).replace(/[^a-z0-9+]+/gi, "_")}.${getFileExtension(timestampedFileName)}`;

        return formattedTimestampedFileName;
    }
}
