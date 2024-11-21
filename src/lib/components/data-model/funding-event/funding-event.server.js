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
    getAllEnumOptions,
    getEntityAttributes
} from "../_helpers/helpers.server";

/**
 * @typedef { import("@prisma/client").funding_event } FundingEvent
 * @typedef { import("@prisma/client").Prisma.funding_eventCreateInput } FundingEventCreateInput
 * @typedef { import("@prisma/client").Prisma.funding_eventUpdateInput } FundingEventUpdateInput
 */

/**
 * A point on a two dimensional plane.
 * @typedef {Object} FundingEventData
 * @property {Object[]} fundingEventArray
 * @property {number} fundingEventTotalCount
 * @property {Object<?string, string[]>} enums
 */

// DX-NOTE: Maximum number of options to load for related entities
const RELATIONSHIP_LOAD_LIMIT = 50;

// DX-NOTE: Configuration for which attributes to search through.
//          This search performs a fuzzy LIKE comparison using wildcards, and as such
//          IGNORES any non-text data types.
const searchConfig = {
    attributes: ["description", "amount", "type", "issuedShares", "allocatedShares", "hasSharesIssuedAffect", "fundingDate", "vestingDate"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

/**
 *
 * @param {Object} constraints
 * @returns {Promise<FundingEventData>}
 */
export const loadFundingEventArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("fundingEvent");
    const prismaConditions = getPrismaConditions("fundingEvent", searchConfig, constraints);

    const fundingEventArray = await prisma.funding_event.findMany({
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(fundingEventArray);

    const totalCountConstraints = { search: constraints.search, filter: constraints.filter };
    const totalCountPrismaConditions = getPrismaConditions("fundingEvent", searchConfig, totalCountConstraints);
    const fundingEventTotalCount = await prisma.funding_event.count({ ...totalCountPrismaConditions });

    const enums = {};
    getAllEnumOptions("fundingEvent", enums);

    return { fundingEventArray, fundingEventTotalCount, enums };
};

/**
 * @param {number} id
 * @return {Promise<{fundingEvent: ?FundingEvent, relationshipData?: any[], associatedData?: any[]}>}
 */
export const loadFundingEvent = async (id, relationshipOptions = true) => {
    const fundingEvent = await prisma.funding_event.findUnique({
        where: { id: id }
    });

    if (!fundingEvent) return { fundingEvent: null };

    const attributeNameTypeMap = getEntityAttributeUiTypes("fundingEvent");
    const attributes = getEntityAttributes("fundingEvent", true);

    for (const [key, val] of Object.entries(fundingEvent)) {
        if (val && attributeNameTypeMap[key] === "date") {
            fundingEvent[key] = formatISO(val, { representation: "date" });
        }

        if (val && attributeNameTypeMap[key] === "datetime-local") {
            fundingEvent[key] = format(val, "yyyy-MM-dd'T'hh:mm");
        }

        if (val && attributes[key]?.type?.toLowerCase() === "decimal") {
            fundingEvent[key] = parseFloat(val?.toString());
        }
    }

    let returnObject = { fundingEvent };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getFundingEventRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData
    };

    if (getEntitiesRelatedTo("fundingEvent").length === 0) return returnObject;

    const associatedData = await getFundingEventAssociatedData(fundingEvent?.id);
    returnObject = {
        ...returnObject,
        ...associatedData
    };

    return returnObject;
};

/**
 * @param {FundingEventCreateInput} data
 * @return {Promise<FundingEvent>}
 */
export const createFundingEvent = async (data) => {
    return await prisma.funding_event.create({ data });
};

/**
 * @param {FundingEventUpdateInput} data
 * @return {Promise<FundingEvent>}
 */
export const updateFundingEvent = async (data) => {
    await prisma.funding_event.update({
        data,
        where: { id: data.id }
    });
};

/**
 * @param {number} id
 */
export const deleteFundingEvent = async (id) => {
    await prisma.funding_event.delete({ where: { id } });
};

/**
 * @return {Promise<Object.<?string, any[]>>}
 */
export const getFundingEventRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.fundIdOptions = await getFundIdOptions();
relationshipData.userAccountIdOptions = await getUserAccountIdOptions();
;

    return relationshipData;
};

/**
 * @param {number} fundingEventId
 * @return {Promise<Object.<?string, any[]>>}
 */
export const getFundingEventAssociatedData = async (fundingEventId) => {
    const associatedData = {};

    ;

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getFundIdOptions = async () => {
    const fundIdArray = await prisma.fund.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const fundIdOptions = fundIdArray.map((fund_id) => {
        fund_id.id = fund_id.id.toString();
        return fund_id;
    });

    return fundIdOptions;
};
const getUserAccountIdOptions = async () => {
    const userAccountIdArray = await prisma.user_account.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const userAccountIdOptions = userAccountIdArray.map((user_account_id) => {
        user_account_id.id = user_account_id.id.toString();
        return user_account_id;
    });

    return userAccountIdOptions;
};
;
;

//#endregion RelatedEntity / AssociatedEntity Helpers
