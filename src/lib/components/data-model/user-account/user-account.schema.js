import { z } from "zod";

export const userAccountCreateSchema = z.object({
    first_name: z.string().trim().min(1, "Required"),
    last_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    password: z.string().trim(),
    user_role_id: z.string().trim()
});

export const userAccountUpdateSchema = z.object({
    id: z.coerce.string(),
    first_name: z.string().trim().min(1, "Required"),
    last_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    password: z.string().trim(),
    user_role_id: z.string().trim()
});
