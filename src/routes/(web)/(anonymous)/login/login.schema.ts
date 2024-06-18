import { z } from "zod";

export const loginSchema = z.object({
    email_address: z.string().email().max(150),
    password: z.string().min(1, { message: "Required" })
});

export type LoginSchema = typeof loginSchema;
