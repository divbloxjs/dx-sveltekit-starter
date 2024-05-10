import { prisma } from "./prisma-instance";

export const seedUserRoles = async () => {
    const result = await prisma.userRole.createMany({ data: [{ roleName: "Admin" }, { roleName: "User" }] });
    console.log(result);
};
