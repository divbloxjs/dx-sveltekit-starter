import { z } from "zod";

export const confirmPasswordResetSchema = z
    .object({
        password: z
            .string()
            .trim()
            .min(8, { message: "Must contain at least 8 characters" })
            .max(50)
            .regex(/^(?=.*[A-Z])/, "Must contain a capital letter")
            .regex(/^(?=.*[a-z])/, "Must contain a small letter")
            .regex(/^(?=.*[0-9])/, "Must contain a number")
            .regex(/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/, "Must contain a special character"),
        confirmPassword: z.string().trim(),
        tokenValue: z.string().length(32)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
