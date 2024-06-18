import { z } from "zod";

export const userAccountCreateSchema = z.object({
    last_name: z.string().trim().min(1, "Required"),
    username: z.string().trim().min(1, "Required"),
    first_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    hashedPassword: z.string().trim().min(1, "Required"),
    userRoleId: z.string().trim()
});

export const userAccountUpdateSchema = z.object({
    id: z.coerce.string(),
    last_name: z.string().trim().min(1, "Required"),
    username: z.string().trim().min(1, "Required"),
    first_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    hashedPassword: z.string().trim().min(1, "Required"),
    userRoleId: z.string().trim()
});
