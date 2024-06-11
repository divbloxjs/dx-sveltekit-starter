import { z } from "zod";

export const userAccountCreateSchema = z.object({
    lastName: z.string().trim().min(1, 'Required'),
	username: z.string().trim().min(1, 'Required'),
	firstName: z.string().trim().min(1, 'Required'),
	emailAddress: z.string().trim().min(1, 'Required'),
	hashedPassword: z.string().trim().min(1, 'Required'),
	userRoleId: z.string().trim(),
});

export const userAccountUpdateSchema = z.object({
    id: z.coerce.string(),
    lastName: z.string().trim().min(1, 'Required'),
	username: z.string().trim().min(1, 'Required'),
	firstName: z.string().trim().min(1, 'Required'),
	emailAddress: z.string().trim().min(1, 'Required'),
	hashedPassword: z.string().trim().min(1, 'Required'),
	userRoleId: z.string().trim(),
});
