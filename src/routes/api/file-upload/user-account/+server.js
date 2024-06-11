import { error, fail, json } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma-instance";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { FileController } from "$lib/components/file-uploader/server/upload.server";
import { AWS_PRIVATE_BUCKET_NAME, AWS_PUBLIC_BUCKET_NAME } from "$env/static/private";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "profilePicture";

// TODO COMMENT
const UPLOAD_AS_PUBLIC = false;
const GENERATE_SMALLER_IMAGES = true;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url, locals }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id") ?? locals.user.id;

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
        const files = await prisma.file.findMany({ where: { linkedEntityId, linkedEntity: "userAccount", category: "profilePicture" } });
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
        const fileController = new FileController();
        const filesToCreate = await fileController.uploadFiles({
            files: filesToUpload,
            linkedEntityId,
            linkedEntity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            createThumbnailAndWebImages: createThumbnailAndWebImages,
            cloudIsPubliclyAvailable: isPublic
        });

        if (!filesToCreate) error(400, "Could not upload files");

        await prisma.file.createMany({ data: filesToCreate });

        const createdFiles = await prisma.file.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId, category: UPLOAD_TYPE } });

        const filesDataToReturn = [];
        for (let createdFile of createdFiles) {
            const urls = {};
            for (let sizeType of createdFile.sizesSaved) {
                urls[sizeType] = await fileController.getUrlForDownload({
                    containerIdentifier: createdFile.cloudContainerIdentifier,
                    objectIdentifier: `${sizeType}_${createdFile.objectIdentifier}`,
                    isPublic: createdFile.cloudIsPubliclyAvailable
                });
            }

            const file = {
                id: createdFile.id.toString(),
                urls,
                objectIdentifier: createdFile.objectIdentifier,
                sizesSaved: createdFile.sizesSaved,
                linkedEntity: createdFile.linkedEntity,
                linkedEntityId: createdFile.linkedEntityId?.toString(),
                mimeType: createdFile.mimeType,
                originalSizeInBytes: createdFile.originalSizeInBytes,
                uploadedFileExtension: getFileExtension(createdFile.displayName),
                displayName: createdFile.displayName
            };

            filesDataToReturn.push(file);
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

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, url, locals }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id") ?? locals.user.id;
    const linkedEntity = "userAccount";

    prisma.file.update({ where: { id: fileId } });

    try {
        return json({});
    } catch (err) {
        console.error(err);
        return error(400, err?.message);
    }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, url, locals }) {
    locals.auth.isAuthenticated();

    console.log(" locals.user.id", locals?.user?.id);
    // TODO Auth on who you are and what files you can update
    try {
        const linkedEntityId = url.searchParams.get("id") ?? locals?.user?.id;

        console.log("linkedEntityId", linkedEntityId);
        const category = url.searchParams.get("category") ?? "";
        const files = await prisma.file.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId, category } });

        const fileController = new FileController();
        const filesToReturn = [];
        for (let i = 0; i < files.length; i++) {
            const urls = {};

            for (let sizeType of files[i].sizesSaved) {
                urls[sizeType] = await fileController.getUrlForDownload({
                    containerIdentifier: files[i].cloudContainerIdentifier,
                    objectIdentifier: `${sizeType}_${files[i].objectIdentifier}`,
                    cloudIsPubliclyAvailable: files[i].cloudIsPubliclyAvailable
                });
            }

            filesToReturn.push({
                id: files[i].id.toString(),
                urls,
                objectIdentifier: files[i].objectIdentifier,
                sizesSaved: files[i].sizesSaved,
                linkedEntity: files[i].linkedEntity,
                linkedEntityId: files[i].linkedEntityId?.toString(),
                mimeType: files[i].mimeType,
                originalSizeInBytes: files[i].originalSizeInBytes,
                uploadedFileExtension: getFileExtension(files[i].displayName),
                displayName: files[i].displayName
            });
        }

        return json({ files: filesToReturn });
    } catch (err) {
        console.error(err);
        return json({ message: err?.message ?? "Error occurred. Please try again" }, { status: 400 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request }) {
    // TODO Auth on who you are and what files you can update

    const body = await request.json();

    try {
        const file = await prisma.file.findFirst({ where: { id: body.id } });
        const fileController = new FileController();

        for (let sizeType of file?.sizesSaved ?? []) {
            let finalObjectIdentifier = `${sizeType}_${file.objectIdentifier}`;
            let containerIdentifier = AWS_PRIVATE_BUCKET_NAME;
            if (file?.cloudIsPubliclyAvailable) {
                finalObjectIdentifier = `public/${finalObjectIdentifier}`;
                containerIdentifier = AWS_PUBLIC_BUCKET_NAME;
            }

            await fileController.deleteFile({ objectIdentifier: finalObjectIdentifier, containerIdentifier });
        }

        await prisma.file.delete({ where: { id: body.id } });
        return json({ message: "Deleted successfully!" });
    } catch (err) {
        console.error(err);
        return fail(400);
    }
}

const deleteFiles = async (files) => {
    try {
        for (const file of files) {
            const fileController = new FileController();

            for (let sizeType of file?.sizesSaved ?? []) {
                let finalObjectIdentifier = `${sizeType}_${file.objectIdentifier}`;
                let containerIdentifier = AWS_PRIVATE_BUCKET_NAME;
                if (file?.cloudIsPubliclyAvailable) {
                    finalObjectIdentifier = `public/${finalObjectIdentifier}`;
                    containerIdentifier = AWS_PUBLIC_BUCKET_NAME;
                }

                await fileController.deleteFile({ objectIdentifier: finalObjectIdentifier, containerIdentifier });
            }
        }
    } catch (err) {
        console.error(err);
        return fail(400);
    }

    await prisma.file.deleteMany({ where: { id: { in: files.map((file) => file.id) } } });
    return json({ message: "Deleted successfully!" });
};
