import { getGuid } from "$lib/server/helpers";
import { S3Controller } from "$lib/server/s3.helpers";
import { json } from "@sveltejs/kit";
import https from "https";

export const POST = async ({ request }) => {
    console.log("request", request);

    const data = await request.json();
    console.log("data", data);
    const s3 = new S3Controller();

    const guid = getGuid();
    const presignedUrl = await s3.createPresignedUrlForUpload({ bucketName: "danis0312testinguploads", objectKey: guid });
    console.log("presignedUrl", presignedUrl);
    // const result = await put(presignedUrl, "asdasd");
    // console.log(result);
    return json({ presignedUrl });
};

function put(url, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: "PUT", headers: { "Content-Length": new Blob([data]).size } }, (res) => {
            let responseBody = "";
            res.on("data", (chunk) => {
                responseBody += chunk;
            });
            res.on("end", () => {
                resolve(responseBody);
            });
        });
        req.on("error", (err) => {
            reject(err);
        });
        req.write(data);
        req.end();
    });
}
