import { z } from "zod";

export const userAccountCreateSchema = z.object({
    firstName: z.string().trim().min(1, "Required"),
    lastName: z.string().trim().min(1, "Required"),
    emailAddress: z.string().email().trim().min(1, "Required"),
    userRoleId: z.string().trim()
});

export const userAccountUpdateSchema = z.object({
    id: z.coerce.string(),
    firstName: z.string().trim().min(1, "Required"),
    lastName: z.string().trim().min(1, "Required"),
    emailAddress: z.string().trim().min(1, "Required"),
    userRoleId: z.string().trim()
});
