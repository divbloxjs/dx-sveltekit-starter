import { AWS_BUCKET_NAME } from "$env/static/private";
import { error, fail, json } from "@sveltejs/kit";

import { S3Controller } from "$lib/server/s3.helpers";
import { prisma } from "$lib/server/prisma-instance";
import { getGuid } from "$lib/server/helpers";
import { getFileExtension } from "$lib/components/file-uploader/functions";
import { UploadController } from "$lib/components/file-uploader/server/upload.server";
import { sleep } from "dx-utilities";
import { getIntId } from "$lib/dx-components/data-model/_helpers/helpers";

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

    const uploadController = new UploadController({});

    try {
        const files = await uploadController.uploadFiles({
            files: filesToUpload,
            linkedEntityId,
            linkedEntity: LINKED_ENTITY,
            category: UPLOAD_TYPE,
            sizeClassification: SIZE_TYPE
        });

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

        const uploadController = new UploadController();
        const files = [];
        for (let i = 0; i < fileUploads.length; i++) {
            const url = await uploadController.getUrlForDownload({
                containerIdentifier: fileUploads[i].cloudContainerIdentifier,
                objectIdentifier: fileUploads[i].objectIdentifier
            });

            files.push({
                url,
                objectIdentifier: fileUploads[i].objectIdentifier,
                sizeClassification: fileUploads[i].sizeClassification,
                linkedEntity: fileUploads[i].linkedEntity,
                linkedEntityId: fileUploads[i].linkedEntityId?.toString(),
                mimeType: fileUploads[i].mimeType,
                sizeInBytes: fileUploads[i].sizeInBytes,
                uploadedFileExtension: getFileExtension(fileUploads[i].displayName),
                displayName: fileUploads[i].displayName
            });
        }

        let finalFiles = [];
        files.forEach((file) => {
            const uniqueFileRef = `${file.linkedEntity}_${file.linkedEntityId}_${file.objectIdentifier}`;
            const foundFile = finalFiles.find((finalFile) => finalFile.uniqueFileRef === uniqueFileRef);
            if (!foundFile) {
                finalFiles.push({ uniqueFileRef: uniqueFileRef, sizes: { [file.sizeClassification]: file } });
            } else {
                finalFiles = finalFiles.map((finalFile) => {
                    if (finalFile.uniqueFileRef === uniqueFileRef) {
                        return { ...finalFile, sizes: { ...finalFile.sizes, [file.sizeClassification]: file } };
                    } else {
                        return finalFile;
                    }
                });
            }
        });

        return json({ files: finalFiles });
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
