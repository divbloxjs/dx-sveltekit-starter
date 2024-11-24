import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";
import { getSqlFromCamelCase } from "$lib/helpers";
import { format } from "date-fns";

import { normalizeDatabaseArray } from "../_helpers/helpers";
import {
    getEntitiesRelatedTo,
    getRelatedEntities,
    getEntityAttributeUiTypes,
    getRelationships,
    getAllEnumOptions
} from "../_helpers/helpers.server";

/**
 * @typedef { import("@prisma/client").user_role } UserRole
 * @typedef { import("@prisma/client").Prisma.user_roleCreateInput } UserRoleCreateInput
 * @typedef { import("@prisma/client").Prisma.user_roleUpdateInput } UserRoleUpdateInput
 */

/**
 * A point on a two dimensional plane.
 * @typedef {Object} UserRoleData
 * @property {Object[]} userRoleArray
 * @property {number} userRoleTotalCount
 * @property {Object<?string, string[]>} enums
 */

// DX-NOTE: Maximum number of options to load for related entities
const RELATIONSHIP_LOAD_LIMIT = 50;

// DX-NOTE: Configuration for which attributes to search through.
//          This search performs a fuzzy LIKE comparison using wildcards, and as such
//          IGNORES any non-text data types.
const searchConfig = {
    attributes: ["roleName"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

/**
 *
 * @param {Object} constraints
 * @returns {Promise<UserRoleData>}
 */
export const loadUserRoleArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("userRole");
    const prismaConditions = getPrismaConditions("userRole", searchConfig, constraints);

    const userRoleArray = await prisma.user_role.findMany({
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(userRoleArray);

    const totalCountConstraints = { search: constraints.search, filter: constraints.filter };
    const totalCountPrismaConditions = getPrismaConditions("userRole", searchConfig, totalCountConstraints);
    const userRoleTotalCount = await prisma.user_role.count({ ...totalCountPrismaConditions });

    const enums = {};
    getAllEnumOptions("userRole", enums);

    return { userRoleArray, userRoleTotalCount, enums };
};

/**
 * @param {number} id
 * @return {Promise<{userRole: ?UserRole, relationshipData?: any[], associatedData?: any[]}>}
 */
export const loadUserRole = async (id, relationshipOptions = true) => {
    const userRole = await prisma.user_role.findUnique({
        where: { id: id }
    });

    const attributeNameTypeMap = getEntityAttributeUiTypes("userRole");

    for (const [key, val] of Object.entries(userRole)) {
        if (val && attributeNameTypeMap[key] === "date") {
            userRole[key] = format(val, "yyyy-MM-dd");
        }

        if (val && attributeNameTypeMap[key] === "datetime-local") {
            userRole[key] = format(val, "yyyy-MM-dd'T'hh:mm");
        }
    }

    for (const [relatedEntityName, relationshipNames] of Object.entries(getRelationships("userRole"))) {
        for (const relationshipName of relationshipNames) {
            userRole[getSqlFromCamelCase(relationshipName)] = userRole[getSqlFromCamelCase(relationshipName)]?.toString();
        }
    }

    let returnObject = { userRole };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getUserRoleRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData
    };

    if (getEntitiesRelatedTo("userRole").length === 0) return returnObject;

    const associatedData = await getUserRoleAssociatedData(userRole?.id);
    returnObject = {
        ...returnObject,
        ...associatedData
    };

    return returnObject;
};

/**
 * @param {UserRoleCreateInput} data
 * @return {Promise<UserRole>}
 */
export const createUserRole = async (data) => {
    const relationships = getRelatedEntities("userRole");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userRole");

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

    await prisma.user_role.create({ data });
};

/**
 * @param {UserRoleUpdateInput} data
 * @return {Promise<UserRole>}
 */
export const updateUserRole = async (data) => {
    const relationships = getRelatedEntities("userRole");
    const attributeNameTypeMap = getEntityAttributeUiTypes("userRole");

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

    await prisma.user_role.update({
        data,
        where: { id: data.id }
    });
};

/**
 * @param {number} id
 */
export const deleteUserRole = async (id) => {
    await prisma.user_role.delete({ where: { id } });
};

/**
 * @return {Promise<Object.<?string, any[]>>}
 */
export const getUserRoleRelationshipData = async () => {
    const relationshipData = {};

    return relationshipData;
};

/**
 * @param {number} userRoleId
 * @return {Promise<Object.<?string, any[]>>}
 */
export const getUserRoleAssociatedData = async (userRoleId) => {
    const associatedData = {};

    associatedData.userAccount = await getAssociatedUserAccountArray(userRoleId);
    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

/**
 * @param {number} userRoleId
 * @returns {Promise<any[]>}
 */
const getAssociatedUserAccountArray = async (userRoleId) => {
    const userAccountArray = await prisma.user_account.findMany({
        where: { user_role_id: userRoleId },
        take: RELATIONSHIP_LOAD_LIMIT
    });

    return userAccountArray;
};

//#endregion RelatedEntity / AssociatedEntity Helpers
