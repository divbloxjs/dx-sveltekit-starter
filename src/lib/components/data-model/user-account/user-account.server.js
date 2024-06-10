import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities } from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["lastName", "username", "firstName", "emailAddress", "hashedPassword"],
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadUserAccountArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userAccount");
    const prismaConditions = getPrismaConditions("userAccount", searchConfig, constraints);

    const userAccountArray = await prisma.userAccount.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions,
    });

    try {
        normalizeDatabaseArray(userAccountArray);
    } catch (err) {
        console.error(err);
    }

    return { userAccountArray };
};

export const createUserAccount = async (data) => {
    try {
        await prisma.userAccount.create({ data });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const updateUserAccount = async (data) => {
    const relationships = getRelatedEntities("userAccount");

    Object.values(relationships).forEach((relationshipName) => {
        if (data.hasOwnProperty(relationshipName)) {
            if (!isNumeric(data[relationshipName])) {
                delete data[relationshipName];
                console.error(
                    `Removed non-numeric relationship '${relationshipName}' value: ${data[relationshipName]}`,
                );
            }

            if (typeof data[relationshipName] === "string") {
                data[relationshipName] = parseInt(data[relationshipName]);
            }
        } else {
            data[relationshipName] = null;
        }
    });

    try {
        const result = await prisma.userAccount.update({
            data,
            where: { id: data.id },
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const deleteUserAccount = async (id = -1) => {
    try {
        await prisma.userAccount.delete({ where: { id } });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const loadUserAccount = async (id = -1, relationshipOptions = true) => {
    const userAccount = await prisma.userAccount.findUnique({
        where: { id: id },
    });

    userAccount.id = userAccount.id.toString();
    Object.keys(getRelatedEntities("userAccount")).forEach((relationshipName) => {
        userAccount[`${relationshipName}Id`] = userAccount[`${relationshipName}Id`]?.toString();
    });

    let returnObject = { userAccount };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getUserAccountRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData,
    };

    if (getEntitiesRelatedTo("userAccount").length === 0) return returnObject;

    const associatedData = await getUserAccountAssociatedData(userAccount?.id);
    returnObject = {
        ...returnObject,
        ...associatedData,
    };

    return returnObject;
};

export const getUserAccountRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.userRoleOptions = await getUserRoleOptions();
;

    return relationshipData;
};

export const getUserAccountAssociatedData = async (userAccountId) => {
    const associatedData = {};

    associatedData.userSession = await getAssociatedUserSessionArray(userAccountId);
associatedData.pushSubscription = await getAssociatedPushSubscriptionArray(userAccountId);
;

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getUserRoleOptions = async () => {
    const userRoleArray = await prisma.userRole.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const userRoleOptions = userRoleArray.map((userRole) => {
        userRole.id = userRole.id.toString();
        return userRole;
    });

    return userRoleOptions;
};
;
const getAssociatedUserSessionArray = async (userAccountId) => {
    const userSessionArray = await prisma.userSession.findMany({
        where: { userAccountId: userAccountId },
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    return userSessionArray;
};
const getAssociatedPushSubscriptionArray = async (userAccountId) => {
    const pushSubscriptionArray = await prisma.pushSubscription.findMany({
        where: { userAccountId: userAccountId },
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    return pushSubscriptionArray;
};
;

//#endregion RelatedEntity / AssociatedEntity Helpers
