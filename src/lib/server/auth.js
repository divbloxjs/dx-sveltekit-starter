import { redirect } from "@sveltejs/kit";
import { prisma } from "./prisma-instance";
import { addMinutes, isBefore } from "date-fns";
import { goto } from "$app/navigation";

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const authenticateUser = async ({ cookies }) => {
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

    console.log(userSession);
    if (!userSession) return null;

    if (isBefore(userSession.expiryDateTime, new Date())) {
        await prisma.userSession.delete({ where: { id: userSession.id } });
        return null;
    }

    // Update session expiry date
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

    let userInfo = {
        id: userSession?.userAccount?.id,
        firstName: userSession?.userAccount?.firstName,
        lastName: userSession?.userAccount?.lastName,
        emailAddress: userSession?.userAccount?.lastName,
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
