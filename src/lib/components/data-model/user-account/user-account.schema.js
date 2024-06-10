import { z } from "zod";

export const userAccountSchema = z.object({
    id: z.coerce.string().trim(),
    lastName: z.string().trim(),
    firstName: z.string().trim(),
    emailAddress: z.string().trim(),
    hashedPassword: z.string().trim(),
    username: z.string().trim(),
    userRoleId: z.string().trim()
});
