import { fail, json } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import { S3Controller } from "$lib/server/s3.helpers";
import { prisma } from "$lib/server/prisma-instance";
import { getGuid } from "$lib/server/helpers";
import { sleep } from "dx-utilities";

export async function POST({ request }) {
    const s3 = new S3Controller();
    const formData = Object.fromEntries(await request.formData());
    console.log("formData", formData);
    const files = Object.values(formData);
    console.log("files", files);

    if (files.length === 0) {
        return json({
            success: true
        });
    }

    await sleep(1500);
    return json({
        success: true
    });

    for (let i = 0; i < files.length; i++) {
        const fileBuffer = await files[i].arrayBuffer();
        const objectKey = getGuid();

        try {
            const response = await s3.putObjectInBucket("danis0312testinguploads", fileBuffer, objectKey);

            const result = await prisma.fileUpload.create({
                data: {
                    bucketName: "danis0312testinguploads",
                    objectKey: objectKey,
                    displayName: files[i].name,
                    finalFileUrl: s3.getUrlFromBucketAndObjectKey("danis0312testinguploads", objectKey),
                    type: "Profile_Picture",
                    sizeType: "original",
                    linkedEntity: "userAccount"
                }
            });
        } catch (err) {
            console.error(err);
            return fail(400);
        }
    }

    return json({
        success: true
    });

    for (let i = 0; i < Object.keys(formData).length; i++) {
        const localGuid = Object.keys(formData)[i];
        const fileToUpload = formData[localGuid];
        if (!fileToUpload.name || fileToUpload.name === "undefined") {
            return fail(400, {
                error: true,
                message: "You must provide a file to upload"
            });
        }

        // Write the file to the static folder
        writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));
    }

    return json({
        success: true
    });
}

export async function GET({ request }) {
    const fileUploads = await prisma.fileUpload.findMany({ where: { linkedEntity: "userAccount" } });
    const s3 = new S3Controller();

    const files = [];

    for (let i = 0; i < fileUploads.length; i++) {
        const url = await s3.createPresignedUrl({ bucket: fileUploads[i].bucketName, key: fileUploads[i].objectKey });
        files.push({
            url,
            guid: fileUploads[i].objectKey,
            displayName: fileUploads[i].displayName
        });
    }

    return json({ files });
}

export async function DELETE({ request }) {
    const body = await request.json();
    try {
        const fileUpload = await prisma.fileUpload.findFirstOrThrow({ where: { objectKey: body.guid } });
        const s3 = new S3Controller();
        const result = await s3.deleteObjectFromBucket("danis0312testinguploads", body.guid);

        await prisma.fileUpload.delete({ where: { id: fileUpload.id } });
        return json({ message: "success!" });
    } catch (err) {
        console.error(err);
    }
    return fail(400);
}
