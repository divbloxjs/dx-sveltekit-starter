// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { AuthenticationManager } from "$lib/server/auth";

export type UserInfo = {
    id: number;
    emailAddress: string;
    firstName: string;
    lastName: string;
    userRole?: {
        id: int;
        roleName: string;
    };
};

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: UserInfo | null; // Your type here
            auth: AuthenticationManager;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
