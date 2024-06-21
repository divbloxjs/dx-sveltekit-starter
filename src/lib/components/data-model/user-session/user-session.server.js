import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import {
    getEntitiesRelatedTo,
    getRelatedEntities,
    getEntityAttributeUiTypes,
    getRelationships,
    getAllEnumOptions
} from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions, getSqlCase } from "$lib/server/prisma.helpers";
import { formatISO } from "date-fns/formatISO";
import { format } from "date-fns";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["expiresAt", "sessionId", "userAgent", "sessionData", "durationInMinutes"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadUserSessionArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userSession");
    const prismaConditions = getPrismaConditions("userSession", searchConfig, constraints);

    const userSessionArray = await prisma.user_session.findMany({
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(userSessionArray);

    const totalCountConstraints = { ...constraints.search, ...constraints.filter };
    const totalCountPrismaConditions = getPrismaConditions("userSession", searchConfig, totalCountConstraints);
    const userSessionTotalCount = await prisma.user_session.count({ ...totalCountPrismaConditions });

    const enums = {};
    getAllEnumOptions("task", enums);
    console.dir(enums, { depth: null });

    return { userSessionArray, userSessionTotalCount, enums };
};

export const createUserSession = async (data) => {
    const relationships = getRelatedEntities("userSession");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userSession");

    for (const [key, val] of Object.entries(data)) {
        if (attributeNameTypeMap[key] === "date" || attributeNameTypeMap[key] === "datetime-local") {
            data[key] = new Date(val);
        }
    }

    Object.values(relationships).forEach((relationshipNames) => {
        relationshipNames.forEach((relationshipName) => {
            relationshipName = getSqlCase(relationshipName);
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

    await prisma.user_session.create({ data });
};

export const updateUserSession = async (data) => {
    const relationships = getRelatedEntities("userSession");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userSession");

    for (const [key, val] of Object.entries(data)) {
        if (attributeNameTypeMap[key] === "date" || attributeNameTypeMap[key] === "datetime-local") {
            data[key] = new Date(val);
        }
    }

    Object.values(relationships).forEach((relationshipNames) => {
        relationshipNames.forEach((relationshipName) => {
            relationshipName = getSqlCase(relationshipName);
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

    await prisma.user_session.update({
        data,
        where: { id: data.id }
    });
};

export const deleteUserSession = async (id = -1) => {
    await prisma.user_session.delete({ where: { id } });
};

export const loadUserSession = async (id = -1, relationshipOptions = true) => {
    const userSession = await prisma.user_session.findUnique({
        where: { id: id }
    });

    userSession.id = userSession.id.toString();

    const attributeNameTypeMap = getEntityAttributeUiTypes("userSession");

    for (const [key, val] of Object.entries(userSession)) {
        if (val && attributeNameTypeMap[key] === "date") {
            userSession[key] = formatISO(val, { representation: "date" });
        }

        if (val && attributeNameTypeMap[key] === "datetime-local") {
            userSession[key] = format(val, "yyyy-MM-dd'T'hh:mm");
        }
    }

    for (const [relatedEntityName, relationshipNames] of Object.entries(getRelationships("userSession"))) {
        for (const relationshipName of relationshipNames) {
            userSession[getSqlCase(relationshipName)] = userSession[getSqlCase(relationshipName)]?.toString();
        }
    }

    let returnObject = { userSession };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getUserSessionRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData
    };

    if (getEntitiesRelatedTo("userSession").length === 0) return returnObject;

    const associatedData = await getUserSessionAssociatedData(userSession?.id);
    returnObject = {
        ...returnObject,
        ...associatedData
    };

    return returnObject;
};

export const getUserSessionRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.userAccountIdOptions = await getUserAccountIdOptions();
    return relationshipData;
};

export const getUserSessionAssociatedData = async (userSessionId) => {
    const associatedData = {};

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getUserAccountIdOptions = async () => {
    const userAccountIdArray = await prisma.user_account.findMany({
        take: RELATIONSHIP_LOAD_LIMIT
    });

    const userAccountIdOptions = userAccountIdArray.map((user_account_id) => {
        user_account_id.id = user_account_id.id.toString();
        return user_account_id;
    });

    return userAccountIdOptions;
};

//#endregion RelatedEntity / AssociatedEntity Helpers
