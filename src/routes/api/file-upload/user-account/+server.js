import { AWS_BUCKET_NAME } from "$env/static/private";
import { fail, json } from "@sveltejs/kit";

import { S3Controller } from "$lib/server/s3.helpers";
import { prisma } from "$lib/server/prisma-instance";
import { getGuid } from "$lib/server/helpers";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { sleep } from "dx-utilities";

const LINKED_ENTITY = "userAccount";
const UPLOAD_TYPE = "Profile_Picture";
const SIZE_TYPE = "original";

// TODO COMMENT
// const UPLOAD_AS_PUBLIC = false;

export async function POST({ request, url }) {
    // TODO Auth on who you are and what files you can update
    const linkedEntityId = url.searchParams.get("id");

    // return fail(400);
    const s3 = new S3Controller();
    const formData = Object.fromEntries(await request.formData());
    const files = Object.values(formData);

    if (files.length === 0) {
        return json({
            success: true,
            files: []
        });
    }

    const filesInfoToReturn = [];
    for (let i = 0; i < files.length; i++) {
        const fileBuffer = await files[i].arrayBuffer();
        const objectKey = getGuid();
        try {
            await s3.putObjectInBucket(AWS_BUCKET_NAME, fileBuffer, objectKey);
            await prisma.fileUpload.create({
                data: {
                    bucketName: AWS_BUCKET_NAME,
                    objectKey: objectKey,
                    displayName: files[i].name,
                    mimeType: files[i].type,
                    sizeInBytes: files[i].size,
                    uploadedFileExtension: getFileExtension(files[i].name),
                    finalFileUrl: s3.getUrlFromBucketAndObjectKey(AWS_BUCKET_NAME, objectKey),
                    type: UPLOAD_TYPE,
                    sizeType: SIZE_TYPE,
                    linkedEntity: LINKED_ENTITY,
                    linkedEntityId
                }
            });

            filesInfoToReturn.push({
                displayName: files[i].name,
                guid: objectKey,
                mimeType: files[i].type,
                sizeInBytes: files[i].size,
                url: await s3.createPresignedUrlForDownload({ bucketName: AWS_BUCKET_NAME, objectKey })
            });
        } catch (err) {
            console.error(err);
            return fail(400);
        }
    }

    return json({
        success: true,
        files: filesInfoToReturn
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
