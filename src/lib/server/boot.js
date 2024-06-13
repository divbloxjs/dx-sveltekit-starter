import { prisma } from "./prisma-instance.js";

export const seedUserRoles = async () => {
    const result = await prisma.userRole.createMany({ data: [{ roleName: "Admin" }, { roleName: "User" }] });
    console.log("Successfully created 'Admin' and 'User' user roles");
};
