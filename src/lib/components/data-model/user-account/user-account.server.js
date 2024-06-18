import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "$components/data-model/_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities } from "$components/data-model/_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions, getSqlCase } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["lastName", "username", "firstName", "emailAddress", "hashedPassword"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadUserAccountArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userAccount");
    const prismaConditions = getPrismaConditions("userAccount", searchConfig, constraints);

    const userAccountArray = await prisma.user_account.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(userAccountArray);

    return { userAccountArray };
};

export const createUserAccount = async (data) => {
    await prisma.user_account.create({ data });
};

export const updateUserAccount = async (data) => {
    const relationships = getRelatedEntities("userAccount");

    Object.values(relationships).forEach((relationshipName) => {
        const sqlCasedRelationshipName = getSqlCase(relationshipName);
        if (data.hasOwnProperty(sqlCasedRelationshipName)) {
            if (!isNumeric(data[sqlCasedRelationshipName])) {
                delete data[sqlCasedRelationshipName];
                console.error(`Removed non-numeric relationship '${sqlCasedRelationshipName}' value: ${data[sqlCasedRelationshipName]}`);
            }

            if (typeof data[sqlCasedRelationshipName] === "string") {
                data[sqlCasedRelationshipName] = parseInt(data[sqlCasedRelationshipName]);
            }
        } else {
            data[sqlCasedRelationshipName] = null;
        }
    });

    await prisma.user_account.update({
        data,
        where: { id: data.id }
    });
};

export const deleteUserAccount = async (id = -1) => {
    await prisma.user_session.deleteMany({ where: { user_account_id: id } });
    await prisma.file.deleteMany({ where: { linked_entity: "userAccount", linked_entity_id: id } });
    await prisma.user_account.delete({ where: { id } });
};

export const loadUserAccount = async (id = -1, relationshipOptions = true) => {
    const userAccount = await prisma.user_account.findUnique({
        where: { id: id }
    });

    userAccount.id = userAccount.id.toString();
    Object.keys(getRelatedEntities("userAccount")).forEach((relationshipName) => {
        const sqlCasedRelationshipName = getSqlCase(`${relationshipName}Id`);
        userAccount[sqlCasedRelationshipName] = userAccount[sqlCasedRelationshipName]?.toString();
    });

    let returnObject = { userAccount };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getUserAccountRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData
    };

    if (getEntitiesRelatedTo("userAccount").length === 0) return returnObject;

    const associatedData = await getUserAccountAssociatedData(userAccount?.id);
    returnObject = {
        ...returnObject,
        ...associatedData
    };

    return returnObject;
};

export const getUserAccountRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.userRoleOptions = await getUserRoleOptions();
    return relationshipData;
};

export const getUserAccountAssociatedData = async (userAccountId) => {
    const associatedData = {};

    associatedData.userSession = await getAssociatedUserSessionArray(userAccountId);
    associatedData.pushSubscription = await getAssociatedPushSubscriptionArray(userAccountId);
    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getUserRoleOptions = async () => {
    const userRoleArray = await prisma.user_role.findMany({
        take: RELATIONSHIP_LOAD_LIMIT
    });

    const userRoleOptions = userRoleArray.map((userRole) => {
        userRole.id = userRole.id.toString();
        return userRole;
    });

    return userRoleOptions;
};
const getAssociatedUserSessionArray = async (userAccountId) => {
    const userSessionArray = await prisma.user_session.findMany({
        where: { user_account_id: userAccountId },
        take: RELATIONSHIP_LOAD_LIMIT
    });

    return userSessionArray;
};
const getAssociatedPushSubscriptionArray = async (userAccountId) => {
    const pushSubscriptionArray = await prisma.push_subscription.findMany({
        where: { user_account_id: userAccountId },
        take: RELATIONSHIP_LOAD_LIMIT
    });

    return pushSubscriptionArray;
};

//#endregion RelatedEntity / AssociatedEntity Helpers
