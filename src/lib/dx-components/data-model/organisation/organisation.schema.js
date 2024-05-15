import { z } from "zod";

export const organisationSchema = z.object({
    id: z.string().trim().max(150).nullable(),
    organisationName: z.string().trim().max(150),
    description: z.string().trim().max(150).nullable(),
    isDefault: z.string().trim().max(150).nullable(),
    details: z.string().trim().max(150).nullable()
});
