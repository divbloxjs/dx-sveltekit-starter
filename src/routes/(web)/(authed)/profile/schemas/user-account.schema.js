import { z } from "zod";

export const userAccountSchema = z.object({
    id: z.coerce.string().max(150).nullable(),
    firstName: z.string().max(150),
    lastName: z.string().max(150),
    emailAddress: z.string().email().max(150)
});
