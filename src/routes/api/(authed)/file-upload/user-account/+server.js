import { error, fail, json } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma-instance";
import { env } from "$env/dynamic/private";
import { FILE_CATEGORY } from "$lib/constants/constants";
import { getStorage } from "$lib/server/storage/storageFactory.server";
import { FileManager } from "$lib/server/storage/fileManager.class.server";
import { urlParamParser } from "$lib/server/urlParamParser.server";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = FILE_CATEGORY.PROFILE_PICTURE;
const STORAGE_PROVIDER = env.STORAGE_PROVIDER ?? "disk";

const UPLOAD_AS_PUBLIC = false;
const GENERATE_SMALLER_IMAGES = true;
const REPLACE_EXISTING_IMAGES = true;

/** @type {import("./$types").RequestHandler} */
export async function POST({ request, url, locals }) {
    // TODO Auth on who you are and what files you can update
    const linked_entity_id = Number(url.searchParams.get("id") ?? locals.user?.id);

    let createThumbnailAndWebImages = urlParamParser.getBoolean(url.searchParams, "createThumbnailAndWebImages") ?? GENERATE_SMALLER_IMAGES;
    let isPublic = urlParamParser.getBoolean(url.searchParams, "uploadAsPublic") ?? UPLOAD_AS_PUBLIC;
    let replaceExistingFiles = urlParamParser.getBoolean(url.searchParams, "replaceExistingFiles") ?? REPLACE_EXISTING_IMAGES;

    const storage = getStorage({ storageProvider: STORAGE_PROVIDER }, { isPublic });
    const fileManager = new FileManager(storage);
    if (replaceExistingFiles) {
        const files = await prisma.file.findMany({
            where: { linked_entity_id, linked_entity: LINKED_ENTITY, category: UPLOAD_TYPE }
        });

        await fileManager.deleteFiles(files);
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
        const fileDataToCreateArr = await fileManager.uploadFiles({
            files: filesToUpload,
            linked_entity_id,
            linked_entity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            createThumbnailAndWebImages: createThumbnailAndWebImages,
            is_public: isPublic
        });

        if (!fileDataToCreateArr) error(400, "Could not upload files");

        await prisma.file.createMany({ data: fileDataToCreateArr });

        for (const fileDataToCreate of fileDataToCreateArr) {
            const urls = {};
            for (let sizeType of fileDataToCreate.sizes_saved) {
                urls[sizeType] = await storage.getUrlForDownload({
                    object_identifier: `${sizeType}_${fileDataToCreate.object_identifier}`
                });
            }

            fileDataToCreate.urls = urls;
        }

        return json({
            success: true,
            files: fileDataToCreateArr
        });
    } catch (err) {
        console.error(err);
        return error(400, err?.message);
    }
}

/** @type {import("./$types").RequestHandler} */
export async function PUT({ request, url, locals }) {
    // TODO Auth on who you are and what files you can update

    if (!url.searchParams.get("id")) error(400, { message: "Invalid ID provided" });

    const id = Number(url.searchParams.get("id"));
    const linked_entity_id = locals.user?.id;
    const linked_entity = "userAccount";

    const formData = Object.fromEntries(await request.formData());

    try {
        const result = await prisma.file.update({ where: { id, linked_entity, linked_entity_id }, data: formData });
        return json(result);
    } catch (err) {
        console.log("err.meta.cause", err.meta.cause);
        return error(400, { message: err.meta.cause });
    }
}

/** @type {import("./$types").RequestHandler} */
export async function GET({ request, url, locals }) {
    const linked_entity_id = Number(url.searchParams.get("id") ?? locals.user?.id);
    const category = urlParamParser.getOrError(url.searchParams, "category");

    try {
        /** @type {import("@prisma/client").Prisma.fileSelect[]} */
        const files = await prisma.file.findMany({
            where: {
                linked_entity: LINKED_ENTITY,
                linked_entity_id,
                category
            }
        });

        const storage = getStorage({ storageProvider: STORAGE_PROVIDER });

        for (let i = 0; i < files.length; i++) {
            const urls = {};
            for (let sizeType of files[i].sizes_saved) {
                urls[sizeType] = await storage.getUrlForDownload({ object_identifier: `${sizeType}_${files[i].object_identifier}` });
            }

            files[0]["urls"] = urls;
        }

        return json({ files });
    } catch (err) {
        console.error(err);
        return error(400, { message: err?.message ?? "Error occurred. Please try again" });
    }
}

/** @type {import("./$types").RequestHandler} */
export async function DELETE({ request }) {
    // TODO Auth on who you are and what files you can update

    const body = await request.json();
    const id = Number(body.id);

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) error(404, "No file found");

    const storage = getStorage({ storageProvider: STORAGE_PROVIDER }, { isPublic: file.is_public, bucketName: file.container_identifier });

    for (let sizeType of file?.sizes_saved ?? []) {
        await storage.deleteFile(`${sizeType}_${file.object_identifier}`);
    }

    await prisma.file.delete({ where: { id } });

    return json({ message: "Deleted successfully!" });
}
