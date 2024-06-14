import argon2 from "argon2";
import { prisma } from "./prisma-instance.js";

export const seedUserRoles = async () => {
    const userRoles = await prisma.userRole.findMany();

    const defaultUserRoles = [{ roleName: "Admin" }, { roleName: "User" }].filter(
        (defaultUserRole) => !userRoles.map((userRole) => userRole.roleName).includes(defaultUserRole.roleName)
    );

    const result = await prisma.userRole.createMany({ data: defaultUserRoles });

    console.log(`Successfully created ${result.count} user roles`);
};

export const seedUsers = async () => {
    await seedUserRoles();

    const actualUserRoles = await prisma.userRole.findMany({ where: { roleName: { in: ["Admin", "User"] } } });

    const userAccounts = await prisma.userAccount.findMany();

    const defaultUserAccounts = [
        {
            firstName: "Admin",
            emailAddress: "admin@example.com",
            username: "admin@example.com",
            hashedPassword: await argon2.hash("password"),
            userRoleId: actualUserRoles.filter((role) => role.roleName === "Admin")[0].id
        },
        {
            firstName: "User",
            emailAddress: "user@example.com",
            username: "user@example.com",
            hashedPassword: await argon2.hash("password"),
            userRoleId: actualUserRoles.filter((role) => role.roleName === "User")[0].id
        }
    ].filter((defaultUserAccount) => !userAccounts.map((userAccount) => userAccount.username).includes(defaultUserAccount.username));

    const result = await prisma.userAccount.createMany({
        data: defaultUserAccounts
    });

    console.log(`Successfully created ${result.count} user accounts`);
};
