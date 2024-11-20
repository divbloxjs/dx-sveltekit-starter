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

export const loadFundingEvent = async (id = -1, relationshipOptions = true) => {
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

    for (const [relatedEntityName, relationshipNames] of Object.entries(getRelationships("fundingEvent"))) {
        for (const relationshipName of relationshipNames) {
            fundingEvent[getSqlFromCamelCase(relationshipName)] = fundingEvent[getSqlFromCamelCase(relationshipName)]?.toString();
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

export const createFundingEvent = async (data) => {
    const relationships = getRelatedEntities("fundingEvent");
    const attributeNameTypeMap = getEntityAttributeUiTypes("fundingEvent");

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

    await prisma.funding_event.create({ data });
};

export const updateFundingEvent = async (data) => {
    const relationships = getRelatedEntities("fundingEvent");
    const attributeNameTypeMap = getEntityAttributeUiTypes("fundingEvent");

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

    await prisma.funding_event.update({
        data,
        where: { id: data.id }
    });
};

export const deleteFundingEvent = async (id = -1) => {
    await prisma.funding_event.delete({ where: { id } });
};

export const getFundingEventRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.fundIdOptions = await getFundIdOptions();
relationshipData.userAccountIdOptions = await getUserAccountIdOptions();
;

    return relationshipData;
};

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
