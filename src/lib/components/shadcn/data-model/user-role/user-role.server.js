import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities } from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["roleName"],
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadUserRoleArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userRole");
    const prismaConditions = getPrismaConditions("userRole", searchConfig, constraints);

    const userRoleArray = await prisma.userRole.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions,
    });

    try {
        normalizeDatabaseArray(userRoleArray);
    } catch (err) {
        console.error(err);
    }

    return { userRoleArray };
};

export const createUserRole = async (data) => {
    try {
        await prisma.userRole.create({ data });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const updateUserRole = async (data) => {
    const relationships = getRelatedEntities("userRole");

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
        const result = await prisma.userRole.update({
            data,
            where: { id: data.id },
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const deleteUserRole = async (id = -1) => {
    try {
        await prisma.userRole.delete({ where: { id } });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const loadUserRole = async (id = -1, relationshipOptions = true) => {
    const userRole = await prisma.userRole.findUnique({
        where: { id: id },
    });

    userRole.id = userRole.id.toString();
    Object.keys(getRelatedEntities("userRole")).forEach((relationshipName) => {
        userRole[`${relationshipName}Id`] = userRole[`${relationshipName}Id`]?.toString();
    });

    let returnObject = { userRole };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getUserRoleRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData,
    };

    if (getEntitiesRelatedTo("userRole").length === 0) return returnObject;

    const associatedData = await getUserRoleAssociatedData(userRole?.id);
    returnObject = {
        ...returnObject,
        ...associatedData,
    };

    return returnObject;
};

export const getUserRoleRelationshipData = async () => {
    const relationshipData = {};

    ;

    return relationshipData;
};

export const getUserRoleAssociatedData = async (userRoleId) => {
    const associatedData = {};

    associatedData.userAccount = await getAssociatedUserAccountArray(userRoleId);
;

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

;
const getAssociatedUserAccountArray = async (userRoleId) => {
    const userAccountArray = await prisma.userAccount.findMany({
        where: { userRoleId: userRoleId },
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    return userAccountArray;
};
;

//#endregion RelatedEntity / AssociatedEntity Helpers
