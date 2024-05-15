import { z } from "zod";

export const organisationSchema = z.object({
    id: z.string().trim().max(150).nullable(),
    organisationName: z.string().trim().max(150),
    description: z.string().trim().max(150).nullable(),
    isDefault: z.boolean(),
    details: z.string().trim().max(150).nullable(),
    placeId: z.string().trim().max(150).nullable(),
    parentOrganisationId: z.string().trim().nullable()
});
