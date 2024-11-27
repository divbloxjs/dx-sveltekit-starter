// Max size is 5MB.
import { z } from "zod";

const MAX_FILE_SIZE = 5000000;

function checkFileType(file: File) {
    if (file?.name) {
        const fileType = file.name.split(".").pop();
        if (fileType === "docx" || fileType === "pdf") return true;
    }
    return false;
}

export const fileSchema = z.object({
    z.any()
        .refine((file: File) => file?.length !== 0, "File is required")
        .refine((file: File) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
        .refine((file: File) => checkFileType(file), "Only .pdf, .docx formats are supported."),
});