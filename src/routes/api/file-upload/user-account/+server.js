import { AWS_BUCKET_NAME } from "$env/static/private";
import { error, fail, json } from "@sveltejs/kit";

import { S3Controller } from "$lib/server/s3.helpers";
import { prisma } from "$lib/server/prisma-instance";
import { getGuid } from "$lib/server/helpers";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { UploadController } from "$lib/components/file-uploader/server/upload.server";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "Profile_Picture";
const SIZE_TYPE = "original";

// TODO COMMENT
// const UPLOAD_AS_PUBLIC = false;

export async function POST({ request, url }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id");

    const formData = Object.fromEntries(await request.formData());
    const filesToUpload = Object.values(formData);

    if (filesToUpload.length === 0) {
        return json({
            success: true,
            files: []
        });
    }

    console.log("filesToUpload", filesToUpload[0]);
    const uploadController = new UploadController(new S3Controller());

    const files = await uploadController.uploadFiles({
        files: filesToUpload,
        linkedEntityId,
        linkedEntity: LINKED_ENTITY,
        uploadType: UPLOAD_TYPE,
        sizeType: SIZE_TYPE
    });

    if (!files) error(400, "Some Message");

    console.log("final success");
    return json({
        success: true,
        files
    });
}

export async function GET({ request, url }) {
    // TODO Auth on who you are and what files you can update

    const linkedEntityId = url.searchParams.get("id");

    const fileUploads = await prisma.fileUpload.findMany({ where: { linkedEntity: LINKED_ENTITY, linkedEntityId } });
    const s3 = new S3Controller();

    const files = [];
    for (let i = 0; i < fileUploads.length; i++) {
        const url = await s3.createPresignedUrlForDownload({ bucketName: fileUploads[i].bucketName, objectKey: fileUploads[i].objectKey });
        files.push({
            url,
            guid: fileUploads[i].objectKey,
            mimeType: fileUploads[i].mimeType,
            sizeInBytes: fileUploads[i].sizeInBytes,
            uploadedFileExtension: getFileExtension(fileUploads[i].displayName),
            displayName: fileUploads[i].displayName
        });
    }

    return json({ files });
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
