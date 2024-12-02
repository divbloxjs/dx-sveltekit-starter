import { error, fail, json } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma-instance";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { env } from "$env/dynamic/private";
import { FILE_CATEGORY } from "$lib/constants/constants";
import { getStorage, storageProviders } from "$lib/server/storage/storageFactory.server";
import { UploadController } from "$lib/server/storage/uploadController.class.server";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = FILE_CATEGORY.PROFILE_PICTURE;
const STORAGE_PROVIDER = env.STORAGE_PROVIDER;

// TODO COMMENT
const UPLOAD_AS_PUBLIC = false;
const GENERATE_SMALLER_IMAGES = true;

/** @type {import("./$types").RequestHandler} */
export async function POST({ request, url, locals }) {
    console.log("HERE");
    // TODO Auth on who you are and what files you can update
    const linked_entity_id = url.searchParams.get("id") ?? locals.user.id;

    let createThumbnailAndWebImages = GENERATE_SMALLER_IMAGES;
    if (url.searchParams.get("createThumbnailAndWebImages")) {
        createThumbnailAndWebImages = url.searchParams.get("createThumbnailAndWebImages").toLowerCase() === "true" ? true : false;
    }

    let isPublic = UPLOAD_AS_PUBLIC;
    if (url.searchParams.get("uploadAsPublic")) {
        isPublic = url.searchParams.get("uploadAsPublic").toLowerCase() === "true" ? true : false;
    }

    let replaceExistingFiles = false;
    if (url.searchParams.get("replaceExistingFiles")) {
        replaceExistingFiles = url.searchParams.get("replaceExistingFiles").toLowerCase() === "true" ? true : false;
    }

    if (replaceExistingFiles) {
        const files = await prisma.file.findMany({
            where: { linked_entity_id, linked_entity: "userAccount", category: FILE_CATEGORY.PROFILE_PICTURE }
        });
        await deleteFiles(files);
    }

    const formData = Object.fromEntries(await request.formData());
    const filesToUpload = Object.values(formData);
    if (filesToUpload.length === 0) {
        return json({
            success: true,
            files: []
        });
    }

    try {
        const storage = getStorage({ storageProvider: STORAGE_PROVIDER }, { isPublic });

        const uploadController = new UploadController(storage);
        const filesToCreate = await uploadController.uploadFiles({
            files: filesToUpload,
            linked_entity_id,
            linked_entity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            createThumbnailAndWebImages: createThumbnailAndWebImages,
            is_public: isPublic
        });

        if (!filesToCreate) error(400, "Could not upload files");

        await prisma.file.createMany({ data: filesToCreate });

        const filesDataToReturn = [];
        for (const [index, createdFile] of filesToCreate.entries()) {
            const urls = {};
            for (let sizeType of createdFile.sizes_saved) {
                urls[sizeType] = await storage.getUrlForDownload({
                    containerIdentifier: createdFile.container_identifier,
                    object_identifier: `${sizeType}_${createdFile.object_identifier}`,
                    isPublic: createdFile.cloudIsPubliclyAvailable
                });
            }

            filesToCreate.urls = urls;
        }

        return json({
            success: true,
            files: filesDataToReturn
        });
    } catch (err) {
        console.error(err);
        return error(400, err?.message);
    }
}

/** @type {import("./$types").RequestHandler} */
export async function PUT({ request, url, locals }) {
    // TODO Auth on who you are and what files you can update
    const linked_entity_id = url.searchParams.get("id") ?? locals.user.id;
    const linked_entity = "userAccount";

    prisma.file.update({ where: { id: fileId } });

    try {
        return json({});
    } catch (err) {
        console.error(err);
        return error(400, err?.message);
    }
}

/** @type {import("./$types").RequestHandler} */
export async function GET({ request, url, locals }) {
    locals.auth.isAuthenticated();

    try {
        const linked_entity_id = url.searchParams.get("id") ?? locals?.user?.id;

        const category = url.searchParams.get("category") ?? "";
        const files = await prisma.file.findMany({
            where: {
                linked_entity: LINKED_ENTITY,
                linked_entity_id,
                category
            }
        });

        const storage = getStorage({ storageProvider: STORAGE_PROVIDER });
        const filesToReturn = [];
        for (let i = 0; i < files.length; i++) {
            const urls = {};

            for (let sizeType of files[i].sizes_saved) {
                urls[sizeType] = await storage.getUrlForDownload({
                    containerIdentifier: files[i].cloudContainerIdentifier,
                    object_identifier: `${sizeType}_${files[i].object_identifier}`,
                    cloudIsPubliclyAvailable: files[i].cloudIsPubliclyAvailable
                });
            }

            filesToReturn.push({
                id: files[i].id.toString(),
                urls,
                object_identifier: files[i].object_identifier,
                sizes_saved: files[i].sizes_saved,
                linked_entity: files[i].linked_entity,
                linked_entity_id: files[i].linked_entity_id?.toString(),
                mime_type: files[i].mime_type,
                original_size_in_bytes: files[i].original_size_in_bytes,
                uploaded_file_extension: getFileExtension(files[i].display_name),
                display_name: files[i].display_name
            });
        }

        return json({ files: filesToReturn });
    } catch (err) {
        console.error(err);
        return json({ message: err?.message ?? "Error occurred. Please try again" }, { status: 400 });
    }
}

/** @type {import("./$types").RequestHandler} */
export async function DELETE({ request }) {
    // TODO Auth on who you are and what files you can update

    const body = await request.json();
    const id = Number(body.id);

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) error(404, "No file found");

    const storage = getStorage({ storageProvider: STORAGE_PROVIDER }, { isPublic: file.is_public });

    for (let sizeType of file?.sizes_saved ?? []) {
        await storage.deleteFile({
            object_identifier: `${sizeType}_${file.object_identifier}`,
            container_identifier: file.container_identifier
        });
    }

    await prisma.file.delete({ where: { id } });

    return json({ message: "Deleted successfully!" });
}

const deleteFiles = async (files) => {
    const storage = getStorage({ storageProvider: STORAGE_PROVIDER });

    for (const file of files) {
        for (let sizeType of file?.sizes_saved ?? []) {
            await storage.deleteFile({
                object_identifier: `${sizeType}_${file.object_identifier}`,
                container_identifier: file.container_identifier
            });
        }
    }

    await prisma.file.deleteMany({ where: { id: { in: files.map((file) => file.id) } } });

    return json({ message: "Deleted successfully!" });
};
