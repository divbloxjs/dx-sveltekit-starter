import { z } from "zod";

export const userAccountSchema = z
    .object({
        firstName: z.string().max(150),
        lastName: z.string().max(150),
        emailAddress: z.string().email().max(150),
        username: z.string().max(150),
        password: z.string().min(8),
        confirmPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
