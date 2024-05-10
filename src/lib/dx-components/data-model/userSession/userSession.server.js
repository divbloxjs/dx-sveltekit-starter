import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities } from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["sessionId", "userAgent", "sessionData", "expiryDateTime", "durationInMinutes"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadUserSessionArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userSession");
    const prismaConditions = getPrismaConditions("userSession", searchConfig, constraints);

    const userSessionArray = await prisma.userSession.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions
    });

    try {
        normalizeDatabaseArray(userSessionArray);
    } catch (err) {
        console.error(err);
    }

    return { userSessionArray };
};

export const createUserSession = async (data) => {
    try {
        await prisma.userSession.create({ data });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const updateUserSession = async (data) => {
    const relationships = getRelatedEntities("userSession");

    Object.values(relationships).forEach((relationshipName) => {
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

    try {
        const result = await prisma.userSession.update({
            data,
            where: { id: data.id }
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const deleteUserSession = async (id = -1) => {
    try {
        await prisma.userSession.delete({ where: { id } });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const loadUserSession = async (id = -1, relationshipOptions = true) => {
    const userSession = await prisma.userSession.findUnique({
        where: { id: id }
    });

    userSession.id = getIntId(userSession.id);
    Object.keys(getRelatedEntities("userSession")).forEach((relationshipName) => {
        userSession[relationshipName] = getIntId(userSession[relationshipName]);
    });

    const returnObject = { userSession };
    if (!relationshipOptions) return returnObject;

    	returnObject.userAccountOptions = await getUserAccountOptions();
;

    if (getEntitiesRelatedTo("userSession").length === 0) return returnObject;

    returnObject.associatedEntities = {};
    ;

    return returnObject;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getUserAccountOptions = async () => {
    const userAccountArray = await prisma.userAccount.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const userAccountOptions = userAccountArray.map((userAccount) => {
        userAccount.id = userAccount.id.toString();
        return userAccount;
    });

    return userAccountOptions;
};
;
;

//#endregion RelatedEntity / AssociatedEntity Helpers
