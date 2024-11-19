import { error } from "@sveltejs/kit";
import { prisma } from "./prisma-instance";
import { addMinutes, isBefore } from "date-fns";
import { goto } from "$app/navigation";

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const authenticateUser = async ({ route, cookies, request }) => {
    const session_id = cookies.get("sessionId");
    if (!session_id) return null;

    const userSession = await prisma.user_session.findFirst({
        where: { session_id: session_id },
        select: {
            id: true,
            session_id: true,
            session_data: true,
            expires_at: true,
            duration_in_minutes: true,
            user_account: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email_address: true,
                    user_role: { select: { id: true, role_name: true } }
                }
            }
        }
    });

    if (!userSession) return null;

    if (isBefore(userSession.expires_at, new Date())) {
        await prisma.user_session.delete({ where: { id: userSession.id } });
        return null;
    }

    // Update session expiry date

    // DX-NOTE: You can update logic here to handle standalone applications differently
    await prisma.user_session.update({
        where: { id: userSession.id },
        data: { expires_at: addMinutes(new Date(), 20) }
    });

    if (!userSession.user_account?.id) {
        cookies.delete("sessionId", { path: "/" });
        return null;
    }

    // Match cookie expiry date and max age to new session data
    cookies.set("sessionId", userSession.session_id, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * userSession.duration_in_minutes,
        expires: userSession.expires_at
    });

    /**
     * @type {import("../../app").UserInfo}
     */
    let userInfo = {
        id: String(userSession.user_account?.id),
        first_name: userSession.user_account?.first_name,
        last_name: userSession.user_account?.last_name,
        email_address: userSession.user_account?.email_address,
        user_role: null
    };

    if (userSession.user_account?.user_role) {
        userInfo.user_role = {
            id: userSession.user_account?.user_role?.id,
            role_name: userSession.user_account?.user_role?.role_name
        };
    }

    return userInfo;
};

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const logoutUser = async ({ cookies }) => {
    cookies.delete("sessionId", { path: "/" });
    goto("login");
};

export const deleteAllExpiredUserSessions = async () => {
    await prisma.user_session.deleteMany({ where: { expires_at: { lte: new Date() } } });
};

export class AuthorisationManager {
    #event;
    /** @param {import("@sveltejs/kit").RequestEvent} event */
    constructor(event) {
        this.#event = event;
        this.user = event.locals.user;
    }

    isAuthenticated() {
        if (!this.user) error(401, "Unauthorized");

        return this;
    }

    isAdmin() {
        if (this.user?.user_role?.role_name !== userRoles.admin.name) {
            error(403, "Unauthorized");
        }

        return this;
    }

    /** @param {string} roleName */
    hasRole(roleName) {
        if (this.user?.user_role?.role_name !== roleName) {
            error(403, `Missing role: ${roleName}`);
        }

        return this;
    }

    /** @param {string[]} roleNames */
    hasAnyRole(roleNames) {
        if (roleNames.some((roleName) => this.user?.user_role?.role_name === roleName)) {
            error(403, `Incorrect role: '${this.user?.user_role?.role_name}'. Allowed role(s): ${roleNames.join(", ")}`);
        }

        return this;
    }
}

// DX-NOTE: TODO granular permissions e.g. updateProject, createTickets
export const permissions = {};

export const routes = {
    __all: "/", // DX-NOTE: __notation to indicate unique meaning i.e. ALL routes accessible
    _authed: "/(authed)", // DX-NOTE: _notation to indicate route groups, not a specific route
    _anonymous: "/(anonymous)",
    "_password-reset": "/(password-reset)",
    login: "/login",
    register: "/register"
};

export const userRoles = {
    admin: { name: "Admin", routes: [routes.__all], permissions: [] },
    user: { name: "User", routes: [routes._authed], permissions: [] },
    anon: { name: "Anonymous", routes: [routes._anonymous, routes["_password-reset"]] }
};

/**
 * Define a hierarchy to remove need for duplicating array entries
 */
export const userRoleHierarchy = {
    user: ["anon"]
};
