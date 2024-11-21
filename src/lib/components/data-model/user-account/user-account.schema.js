import { z } from "zod";

export const userAccountCreateSchema = z.object({
    first_name: z.string().trim().min(1, "Required"),
    last_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    password: z.string().trim(),
    user_role_id: z.number()
});

export const userAccountUpdateSchema = z.object({
    id: z.number(),
    first_name: z.string().trim().min(1, "Required"),
    last_name: z.string().trim().min(1, "Required"),
    email_address: z.string().trim().min(1, "Required"),
    password: z.string().trim().optional(),
    user_role_id: z.number()
});
