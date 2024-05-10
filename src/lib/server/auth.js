import { redirect } from "@sveltejs/kit";
import { prisma } from "./prisma-instance";
import { addMinutes, isBefore } from "date-fns";

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const authenticateUser = async ({ cookies }) => {
    const sessionId = cookies.get("sessionId");

    const userSession = await prisma.userSession.findFirst({
        where: { sessionId },
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
        prisma.userSession.delete({ where: { id: userSession.id } });
        return null;
    }

    prisma.userSession.update({
        where: { id: userSession.id },
        data: { expiryDateTime: addMinutes(new Date(), 20) }
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

    console.log("userInfo", userInfo);
    return userInfo;
};

/** @param {import('@sveltejs/kit').RequestEvent} event */
export const logoutUser = async ({ cookies }) => {
    cookies.delete("sessionId", { path: "/" });
    redirect(307, "/login");
};
