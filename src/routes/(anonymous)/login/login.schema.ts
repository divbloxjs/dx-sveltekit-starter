import { z } from "zod";

export const loginSchema = z.object({
    emailAddress: z.string().email().max(150),
    password: z.string().min(8)
});

export const initialData = {
    emailAddress: "dani.simeonov@gmail.com",
    password: "12345678"
};

export type LoginSchema = typeof loginSchema;
