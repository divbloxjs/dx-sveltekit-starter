import { z } from "zod";

export const userAccountSchema = z.object({
    id: z.coerce.string().max(150).nullable(),
    firstName: z.string().max(150).nullable(),
    lastName: z.string().max(150).nullable(),
    emailAddress: z.string().email().max(150)
});
