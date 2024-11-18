import { z } from "zod";

export const userRoleCreateSchema = z.object({
    role_name: z.string().trim().min(1, "Required")
});

export const userRoleUpdateSchema = z.object({
    id: z.number().min(0, "Required"),
    role_name: z.string().trim().min(1, "Required")
});
