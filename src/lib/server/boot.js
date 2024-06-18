import argon2 from "argon2";
import { prisma } from "./prisma-instance.js";

export const seedUserRoles = async () => {
    const userRoles = await prisma.user_role.findMany();

    const defaultUserRoles = [{ role_name: "Admin" }, { role_name: "User" }].filter(
        (defaultUserRole) => !userRoles.map((userRole) => userRole.roleName).includes(defaultUserRole.roleName)
    );

    const result = await prisma.user_role.createMany({ data: defaultUserRoles });

    console.log(`Successfully created ${result.count} user roles`);
};

export const seedUsers = async () => {
    await seedUserRoles();

    const actualUserRoles = await prisma.user_role.findMany({ where: { role_name: { in: ["Admin", "User"] } } });

    const userAccounts = await prisma.user_account.findMany();

    const defaultUserAccounts = [
        {
            first_name: "Admin",
            email_address: "admin@example.com",
            username: "admin@example.com",
            hashedPassword: await argon2.hash("password"),
            userRoleId: actualUserRoles.filter((role) => role.roleName === "Admin")[0].id
        },
        {
            first_name: "User",
            email_address: "user@example.com",
            username: "user@example.com",
            hashedPassword: await argon2.hash("password"),
            userRoleId: actualUserRoles.filter((role) => role.roleName === "User")[0].id
        }
    ].filter((defaultUserAccount) => !userAccounts.map((userAccount) => userAccount.username).includes(defaultUserAccount.username));

    const result = await prisma.user_account.createMany({
        data: defaultUserAccounts
    });

    console.log(`Successfully created ${result.count} user accounts`);
};
