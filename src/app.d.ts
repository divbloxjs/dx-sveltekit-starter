// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { AuthorisationManager } from "$lib/server/auth";

export type UserInfo = {
    id: number;
    email_address: string;
    first_name: string;
    last_name: string;
    user_role?: {
        id: int;
        role_name: string;
    };
};

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: UserInfo | null; // Your type here
            auth: AuthorisationManager;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
