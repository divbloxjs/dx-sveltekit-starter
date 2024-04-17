import { fail } from "@sveltejs/kit";
import { writeFileSync } from "fs";

export const actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        console.log(formData);
        if (!formData.fileToUpload.name || formData.fileToUpload.name === "undefined") {
            return fail(400, {
                error: true,
                message: "You must provide a file to upload"
            });
        }

        const { fileToUpload } = formData;

        // Write the file to the static folder
        writeFileSync(`static/${fileToUpload.name}`, Buffer.from(await fileToUpload.arrayBuffer()));

        return {
            success: true
        };
    }
};
