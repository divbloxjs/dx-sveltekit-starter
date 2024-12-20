import { getFileExtension, getFileNameWithoutExtension, insertBeforeFileExtension } from "./functions";
import imageType from "image-type";
import { StorageBase } from "./storage.class.js";
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
     *
     * @param {Object} params
     * @param {File[]} params.files
     * @param {string} params.linked_entity
     * @param {number} params.linked_entity_id
     * @param {string} params.category
     * @param {boolean} params.createThumbnailAndWebImages
     * @param {boolean} params.is_public
     * @returns
     */
    async uploadFiles({ files, linked_entity, linked_entity_id, category, createThumbnailAndWebImages = false, is_public = false }) {
        if (files?.length === 0) return [];

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

            console.log("uploadFiles result ", result);

            uploadedFiles[index] = result;
        }

        return uploadedFiles;
    }

    /**
     * @param {Object} params
     * @param {File} params.file
     * @param {string} params.linked_entity
     * @param {number} params.linked_entity_id
     * @param {string} params.category
     * @param {boolean} [params.createThumbnailAndWebImages]
     * @param {boolean} [params.is_public]
     * @returns
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
            container_identifier: this.#storage.containerIdentifier
            storageProvider: this.#storage.storageProvider
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
            console.log("result", result);
        }

        return fileData;
    }

    /**
     * @param {string} object_identifier
     * @returns {Promise<*>}
     */
    async deleteFile(object_identifier) {
        const file = await prisma.file.findUniqueOrThrow({ where: { object_identifier } });
        if (!file) return;

        try {
            for (let size of file?.sizes_saved ?? []) {
                const result = await this.#storage.deleteFile({
                    object_identifier: `${size}_${file.object_identifier}`,
                    container_identifier: file.container_identifier
                });

                console.log("result", result);
            }
        } catch (err) {
            console.error(err);
            return fail(400);
        }

        await prisma.file.delete({ where: { id: file.id } });
    }

    /**
     * @param {import("@prisma/client").file[]} files
     * @returns {Promise<boolean>}
     */
    async deleteFiles(files = []) {
        const fileIds = files.map((file) => file.id);

        let errors = [];
        try {
            for (const file of files) {
                for (let sizeType of file?.sizes_saved ?? []) {
                    let objectIdentifier = `${sizeType}_${file.object_identifier}`;
                    const storageResult = await this.#storage.deleteFile(objectIdentifier);

                    if (storageResult?.["$metadata"]?.httpStatusCode !== 204) {
                        errors.push({ id: file.id, objectIdentifier, errorInfo: storageResult?.["$metadata"] });
                        continue;
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }

        const errorFileIds = errors.map((err) => err.id);
        const dbResult = await prisma.file.deleteMany({
            where: {
                id: {
                    in: fileIds.filter((id) => !errorFileIds.includes(id))
                }
            }
        });

        console.log("dbResult", dbResult);
        return true;
    }

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
