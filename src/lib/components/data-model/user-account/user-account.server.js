import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";
import { getSqlFromCamelCase } from "$lib/helpers";
import { formatISO } from "date-fns/formatISO";
import { format } from "date-fns";

import { normalizeDatabaseArray } from "../_helpers/helpers";
import {
    getEntitiesRelatedTo,
    getRelatedEntities,
    getEntityAttributeUiTypes,
    getRelationships,
    getAllEnumOptions
} from "../_helpers/helpers.server";

// DX-NOTE: Maximum number of options to load for related entities
const RELATIONSHIP_LOAD_LIMIT = 50;

// DX-NOTE: Configuration for which attributes to search through.
//          This search performs a fuzzy LIKE comparison using wildcards, and as such
//          IGNORES any non-text data types.
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
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(userAccountArray);

    const totalCountConstraints = { search: constraints.search, filter: constraints.filter };
    const totalCountPrismaConditions = getPrismaConditions("userAccount", searchConfig, totalCountConstraints);
    const userAccountTotalCount = await prisma.user_account.count({ ...totalCountPrismaConditions });

    const enums = {};
    getAllEnumOptions("userAccount", enums);

    return { userAccountArray, userAccountTotalCount, enums };
};

export const loadUserAccount = async (id = -1, relationshipOptions = true) => {
    const userAccount = await prisma.user_account.findUnique({
        where: { id: id }
    });

    userAccount.id = userAccount.id.toString();

    const attributeNameTypeMap = getEntityAttributeUiTypes("userAccount");

    for (const [key, val] of Object.entries(userAccount)) {
        if (val && attributeNameTypeMap[key] === "date") {
            userAccount[key] = formatISO(val, { representation: "date" });
        }

        if (val && attributeNameTypeMap[key] === "datetime-local") {
            userAccount[key] = format(val, "yyyy-MM-dd'T'hh:mm");
        }
    }

    for (const [relatedEntityName, relationshipNames] of Object.entries(getRelationships("userAccount"))) {
        for (const relationshipName of relationshipNames) {
            userAccount[getSqlFromCamelCase(relationshipName)] = userAccount[getSqlFromCamelCase(relationshipName)]?.toString();
        }
    }

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

export const createUserAccount = async (data) => {
    const relationships = getRelatedEntities("userAccount");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userAccount");

    for (const [key, val] of Object.entries(data)) {
        if (attributeNameTypeMap[key] === "date" || attributeNameTypeMap[key] === "datetime-local") {
            data[key] = new Date(val);
        }
    }

    Object.values(relationships).forEach((relationshipNames) => {
        relationshipNames.forEach((relationshipName) => {
            relationshipName = getSqlFromCamelCase(relationshipName);
            if (data.hasOwnProperty(relationshipName)) {
                if (!isNumeric(data[relationshipName])) {
                    delete data[relationshipName];
                    console.error(`Removed non-numeric relationship '${relationshipName}' value: ${data[relationshipName]}`);
                }

                if (typeof data[relationshipName] === "string") {
                    data[relationshipName] = parseInt(data[relationshipName]);
                }
            } else {
                data[relationshipName] = null;
            }
        });
    });

    await prisma.user_account.create({ data });
};

export const updateUserAccount = async (data) => {
    const relationships = getRelatedEntities("userAccount");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userAccount");

    for (const [key, val] of Object.entries(data)) {
        if (attributeNameTypeMap[key] === "date" || attributeNameTypeMap[key] === "datetime-local") {
            data[key] = new Date(val);
        }
    }

    Object.values(relationships).forEach((relationshipNames) => {
        relationshipNames.forEach((relationshipName) => {
            relationshipName = getSqlFromCamelCase(relationshipName);
            if (data.hasOwnProperty(relationshipName)) {
                if (!isNumeric(data[relationshipName])) {
                    delete data[relationshipName];
                    console.error(`Removed non-numeric relationship '${relationshipName}' value: ${data[relationshipName]}`);
                }

                if (typeof data[relationshipName] === "string") {
                    data[relationshipName] = parseInt(data[relationshipName]);
                }
            } else {
                data[relationshipName] = null;
            }
        });
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

export const getUserAccountRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.userRoleIdOptions = await getUserRoleIdOptions();
    return relationshipData;
};

export const getUserAccountAssociatedData = async (userAccountId) => {
    const associatedData = {};

    associatedData.userSession = await getAssociatedUserSessionArray(userAccountId);
    associatedData.pushSubscription = await getAssociatedPushSubscriptionArray(userAccountId);
    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getUserRoleIdOptions = async () => {
    const userRoleIdArray = await prisma.user_role.findMany({
        take: RELATIONSHIP_LOAD_LIMIT
    });

    const userRoleIdOptions = userRoleIdArray.map((user_role_id) => {
        user_role_id.id = user_role_id.id.toString();
        return user_role_id;
    });

    return userRoleIdOptions;
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
