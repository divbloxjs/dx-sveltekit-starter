import argon2 from "argon2";
import { prisma } from "./prisma-instance.js";

export const seedUserRoles = async () => {
    const userRoles = await prisma.user_role.findMany();

    const defaultUserRoles = [{ role_name: "Admin" }, { role_name: "User" }].filter(
        (defaultUserRole) => !userRoles.map((userRole) => userRole.role_name).includes(defaultUserRole.role_name)
    );

    const result = await prisma.user_role.createMany({ data: defaultUserRoles });

    console.log(`Successfully created ${result.count} user roles`);
};

export const seedUsers = async () => {
    const existingUserRoles = await prisma.user_role.findMany({ where: { role_name: { in: ["Admin", "User"] } } });

    const existingUserAccounts = await prisma.user_account.findMany();

    const defaultUserAccounts = [
        {
            first_name: "Admin",
            email_address: "admin@example.com",
            username: "admin@example.com",
            hashed_password: await argon2.hash("password"),
            user_role_id: existingUserRoles.filter((role) => role.role_name === "Admin")[0].id
        },
        {
            first_name: "User",
            email_address: "user@example.com",
            username: "user@example.com",
            hashed_password: await argon2.hash("password"),
            user_role_id: existingUserRoles.filter((role) => role.role_name === "User")[0].id
        }
    ];

    const toBeCreatedUserAccounts = defaultUserAccounts.filter(
        (defaultUserAccount) => !existingUserAccounts.map((userAccount) => userAccount.username).includes(defaultUserAccount.username)
    );

    const result = await prisma.user_account.createMany({
        data: toBeCreatedUserAccounts
    });

    console.log(`Successfully created ${result.count} user accounts`);
};

export const initialise = async () => {
    await seedUserRoles();
    await seedUsers();
};

await initialise();
