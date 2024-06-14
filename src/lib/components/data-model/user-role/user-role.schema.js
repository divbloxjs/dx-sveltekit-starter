import { z } from "zod";

export const userRoleCreateSchema = z.object({
    roleName: z.string().trim().min(1, 'Required'),
});

export const userRoleUpdateSchema = z.object({
    id: z.coerce.string(),
    roleName: z.string().trim().min(1, 'Required'),
});
