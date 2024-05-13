import { error, fail, json } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma-instance";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { UploadController } from "$lib/components/file-uploader/server/upload.server";
import { sleep } from "dx-utilities";
import { getIntId } from "$lib/dx-components/data-model/_helpers/helpers";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "Profile_Picture";
const SIZE_TYPE = "original";

// TODO COMMENT
// const UPLOAD_AS_PUBLIC = false;
const GENERATE_SMALLER_IMAGES = true;

export async function POST({ request, url }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id");
    const createThumbnailAndWebImages = url.searchParams.get("createThumbnailAndWebImages") ?? GENERATE_SMALLER_IMAGES;

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
            createThumbnailAndWebImages
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
        const fileUploads = await prisma.fileUpload.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId, category } });

        const uploadController = new UploadController();
        const files = [];
        for (let i = 0; i < fileUploads.length; i++) {
            const urls = {};

            for (let sizeType of fileUploads[i].sizesSaved) {
                urls[sizeType] = await uploadController.getUrlForDownload({
                    containerIdentifier: fileUploads[i].cloudContainerIdentifier,
                    objectIdentifier: `${sizeType}_${fileUploads[i].objectIdentifier}`
                });
            }

            files.push({
                urls,
                objectIdentifier: fileUploads[i].objectIdentifier,
                sizesSaved: fileUploads[i].sizesSaved,
                linkedEntity: fileUploads[i].linkedEntity,
                linkedEntityId: fileUploads[i].linkedEntityId?.toString(),
                mimeType: fileUploads[i].mimeType,
                originalSizeInBytes: fileUploads[i].originalSizeInBytes,
                uploadedFileExtension: getFileExtension(fileUploads[i].displayName),
                displayName: fileUploads[i].displayName
            });
        }

        return json({ files });
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
        await prisma.fileUpload.deleteMany({ where: { objectIdentifier: body.guid } });

        return json({ message: "Deleted successfully!" });
    } catch (err) {
        console.error(err);
        return fail(400);
    }
}
