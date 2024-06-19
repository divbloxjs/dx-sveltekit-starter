import { z } from "zod";

export const taskCreateSchema = z.object({
    status: z.string().trim().min(1, 'Required'),
	due_date: z.string().trim().min(1, 'Required'),
	task_name: z.string().trim().min(1, 'Required'),
	description: z.string().trim().min(1, 'Required'),
	category_id: z.string().trim(),
	user_account_id: z.string().trim(),
});

export const taskUpdateSchema = z.object({
    id: z.coerce.string(),
    status: z.string().trim().min(1, 'Required'),
	due_date: z.string().trim().min(1, 'Required'),
	task_name: z.string().trim().min(1, 'Required'),
	description: z.string().trim().min(1, 'Required'),
	category_id: z.string().trim(),
	user_account_id: z.string().trim(),
});
