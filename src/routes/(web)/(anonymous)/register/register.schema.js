import { z } from "zod";

export const registerSchema = z
    .object({
        // DX-NOTE: Refer to the userAccount entity - username is by default set to emailAddress here
        emailAddress: z.string().email().max(150),
        password: z.string().min(8),
        confirmPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
