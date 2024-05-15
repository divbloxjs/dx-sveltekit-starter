import { z } from "zod";

export const passwordSchema = z
    .object({
        id: z.string().max(150),
        password: z.string().min(8),
        confirmPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
