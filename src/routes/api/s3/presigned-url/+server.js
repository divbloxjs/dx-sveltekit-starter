import { AWS_BUCKET_NAME } from "$env/static/private";
import { getGuid } from "$lib/server/helpers";
import { S3Controller } from "$lib/server/s3.helpers";
import { json } from "@sveltejs/kit";
import https from "https";

export const POST = async ({ request }) => {
    const data = await request.json();
    console.log("data", data);
    const s3 = new S3Controller();

    const guid = getGuid();
    const presignedUrl = await s3.createPresignedUrlForUpload({ bucketName: AWS_BUCKET_NAME, objectKey: guid });
    console.log("presignedUrl", presignedUrl);
    return json({ presignedUrl });
};
