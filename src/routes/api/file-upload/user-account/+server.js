import { error, fail, json } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma-instance";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { UploadController } from "$lib/components/file-uploader/server/upload.server";
import { sleep } from "dx-utilities";
import { getIntId } from "$lib/dx-components/data-model/_helpers/helpers";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "Profile_Picture";

// TODO COMMENT
const UPLOAD_AS_PUBLIC = false;
const GENERATE_SMALLER_IMAGES = true;

export async function POST({ request, url }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id");
    const createThumbnailAndWebImages = url.searchParams.get("createThumbnailAndWebImages") ?? GENERATE_SMALLER_IMAGES;
    const isPublic = url.searchParams.get("isPublic") ?? UPLOAD_AS_PUBLIC;

    const formData = Object.fromEntries(await request.formData());
    const filesToUpload = Object.values(formData);
    if (filesToUpload.length === 0) {
        return json({
            success: true,
            files: []
        });
    }

    try {
        const uploadController = new UploadController();
        const files = await uploadController.uploadFiles({
            files: filesToUpload,
            linkedEntityId,
            linkedEntity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            createThumbnailAndWebImages: createThumbnailAndWebImages,
            isPublic
        });

        if (!files) error(400, "Could not upload files");

        return json({
            success: true,
            files
        });
    } catch (err) {
        console.error(err);
        return error(400, err?.message);
    }
}

export async function GET({ request, url }) {
    // TODO Auth on who you are and what files you can update
    try {
        const linkedEntityId = url.searchParams.get("id");
        const category = url.searchParams.get("category") ?? "";
        const files = await prisma.file.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId, category } });

        const uploadController = new UploadController();
        const filesToReturn = [];
        for (let i = 0; i < files.length; i++) {
            const urls = {};

            for (let sizeType of files[i].sizesSaved) {
                urls[sizeType] = await uploadController.getUrlForDownload({
                    containerIdentifier: files[i].cloudContainerIdentifier,
                    objectIdentifier: `${sizeType}_${files[i].objectIdentifier}`
                });
            }

            filesToReturn.push({
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
    }
}

export async function DELETE({ request }) {
    // TODO Auth on who you are and what files you can update

    const body = await request.json();
    console.log(body);
    try {
        const uploadController = new UploadController();
        await uploadController.deleteFile({ objectIdentifier: body.guid });
        await prisma.file.deleteMany({ where: { objectIdentifier: body.guid } });

        return json({ message: "Deleted successfully!" });
    } catch (err) {
        console.error(err);
        return fail(400);
    }
}
