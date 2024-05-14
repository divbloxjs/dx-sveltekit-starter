import { z } from "zod";

export const passwordSchema = z
    .object({
        password: z.string().min(8),
        confirmPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
