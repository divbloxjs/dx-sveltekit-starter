import { z } from "zod";

export const confirmPasswordResetSchema = z
    .object({
        password: z.string().trim().min(8).max(50),
        confirmPassword: z.string().trim()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
