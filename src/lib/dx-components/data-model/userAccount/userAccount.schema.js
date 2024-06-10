import { z } from "zod";

export const userAccountSchema = z
    .object({
        id: z.coerce.string().trim().max(150).nullable(),
        firstName: z.string().trim().min(1, { message: "Required" }).max(150),
        lastName: z.string().trim().min(1, { message: "Required" }).max(150),
        emailAddress: z.string().trim().email().max(150),
        password: z.string().min(8).nullable(),
        confirmPassword: z.string().min(8).nullable()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
