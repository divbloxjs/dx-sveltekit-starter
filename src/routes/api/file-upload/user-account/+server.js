import { AWS_BUCKET_NAME } from "$env/static/private";
import { error, fail, json } from "@sveltejs/kit";

import { S3Controller } from "$lib/server/s3.helpers";
import { prisma } from "$lib/server/prisma-instance";
import { getGuid } from "$lib/server/helpers";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { UploadController } from "$lib/components/file-uploader/server/upload.server";
import { sleep } from "dx-utilities";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "Profile_Picture";
const SIZE_TYPE = "original";

// TODO COMMENT
// const UPLOAD_AS_PUBLIC = false;

export async function POST({ request, url }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id");
    await sleep(1000);

    if (Math.random() < 0.5) {
        return error(500, "asd");
    }

    const formData = Object.fromEntries(await request.formData());
    const filesToUpload = Object.values(formData);

    if (filesToUpload.length === 0) {
        return json({
            success: true,
            files: []
        });
    }

    console.log(1);
    const uploadController = new UploadController({});

    console.log(2);
    try {
        const files = await uploadController.uploadFiles({
            files: filesToUpload,
            linkedEntityId,
            linkedEntity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            sizeClassification: SIZE_TYPE
        });

        console.log(3);
        if (!files) error(400, "Some Message");

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

        const fileUploads = await prisma.fileUpload.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId } });
        const s3 = new S3Controller();

        const uploadController = new UploadController({ saveInCloud: true });

        const files = [];
        for (let i = 0; i < fileUploads.length; i++) {
            const url = await uploadController.getUrlForDownload({
                containerIdentifier: fileUploads[i].cloudContainerIdentifier,
                objectIdentifier: fileUploads[i].objectIdentifier
            });

            files.push({
                url,
                guid: fileUploads[i].objectIdentifier,
                mimeType: fileUploads[i].mimeType,
                sizeInBytes: fileUploads[i].sizeInBytes,
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
    try {
        const fileUpload = await prisma.fileUpload.findFirstOrThrow({ where: { objectKey: body.guid } });
        const s3 = new S3Controller();
        await s3.deleteObjectFromBucket(AWS_BUCKET_NAME, body.guid);
        await prisma.fileUpload.delete({ where: { id: fileUpload.id } });

        return json({ message: "Deleted successfully!" });
    } catch (err) {
        console.error(err);
        return fail(400);
    }
}
