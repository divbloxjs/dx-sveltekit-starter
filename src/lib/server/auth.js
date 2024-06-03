import { error, redirect } from "@sveltejs/kit";
import { prisma } from "./prisma-instance";
import { addMinutes, isBefore } from "date-fns";
import { goto } from "$app/navigation";

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const authenticateUser = async ({ route, cookies, request }) => {
    const sessionId = cookies.get("sessionId");
    if (!sessionId) return null;

    const userSession = await prisma.userSession.findFirst({
        where: { sessionId: sessionId },
        select: {
            id: true,
            sessionId: true,
            sessionData: true,
            expiryDateTime: true,
            durationInMinutes: true,
            userAccount: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    emailAddress: true,
                    userRole: { select: { id: true, roleName: true } }
                }
            }
        }
    });

    if (!userSession) return null;

    if (isBefore(userSession.expiryDateTime, new Date())) {
        await prisma.userSession.delete({ where: { id: userSession.id } });
        return null;
    }

    // Update session expiry date

    // DX-NOTE: You can update logic here to handle standalone applications differently
    await prisma.userSession.update({
        where: { id: userSession.id },
        data: { expiryDateTime: addMinutes(new Date(), 20) }
    });

    // Match cookie expiry date and max age to new session data
    cookies.set("sessionId", userSession.sessionId, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * userSession.durationInMinutes,
        expires: userSession.expiryDateTime
    });

    /**
     * @type {import("../../app").UserInfo}
     */
    let userInfo = {
        id: userSession.userAccount?.id,
        firstName: userSession.userAccount?.firstName,
        lastName: userSession.userAccount?.lastName,
        emailAddress: userSession.userAccount?.lastName,
        userRole: null
    };

    if (userSession.userAccount?.userRole) {
        userInfo.userRole = {
            id: userSession.userAccount?.userRole?.id,
            roleName: userSession.userAccount?.userRole?.roleName
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
    await prisma.userSession.deleteMany({ where: { expiryDateTime: { lte: new Date() } } });
};

export class AuthenticationManager {
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
        if (this.user?.userRole?.roleName !== userRoles.admin) error(403, "Unauthorized");

        return this;
    }

    hasRole(roleName) {
        if (this.user?.userRole?.roleName !== roleName) error(403, `Missing role: ${roleName}`);

        return this;
    }

    hasAnyRole(roles) {
        if (roles.some((role) => this.user?.roles.includes(role))) {
            error(403, "missing any role: " + roles.join(", "));
        }

        return this;
    }

    hasAllRoles(roles) {
        if (roles.every((role) => this.user?.roles.includes(role))) {
            const missing = roles.filter((role) => !this.user?.roles.includes(role)).join(", ");
            error(403, "missing role(s): " + missing);
        }

        return this;
    }

    isProjectOwner(project) {
        if (!this.user || !project.owners.includes(this.user.uid)) {
            error(403, "not project owner");
        }

        return this;
    }

    isInternalAccount() {
        if (!this.user || !this.user.email?.endsWith("@company.com")) {
            error(403, "not internal account");
        }

        return this;
    }
}

export const userRoles = {
    admin: "Admin",
    user: "User"
};
