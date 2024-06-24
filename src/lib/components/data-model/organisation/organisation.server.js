import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";
import { getCamelFromSqlCase, getSqlFromCamelCase } from "$lib/helpers";
import { formatISO } from "date-fns/formatISO";
import { format } from "date-fns";

import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import {
    getEntitiesRelatedTo,
    getRelatedEntities,
    getEntityAttributeUiTypes,
    getRelationships,
    getAllEnumOptions
} from "../_helpers/helpers.server";

// DX-NOTE: Maximum number of options to load for related entities
const RELATIONSHIP_LOAD_LIMIT = 50;

// DX-NOTE: Configuration for which attributes to search through
const searchConfig = {
    attributes: ["orgName", "orgDate", "orgDateTime", "orgNumber", "orgJson", "status"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadOrganisationArray = async (constraints = {}) => {
    console.log("constraints", constraints);
    const selectClause = getPrismaSelectAllFromEntity("organisation");
    const prismaConditions = getPrismaConditions("organisation", searchConfig, constraints);

    const organisationArray = await prisma.organisation.findMany({
        select: selectClause,
        ...prismaConditions
    });

    normalizeDatabaseArray(organisationArray);

    const totalCountConstraints = { ...constraints.search, ...constraints.filter };
    const totalCountPrismaConditions = getPrismaConditions("organisation", searchConfig, totalCountConstraints);
    const organisationTotalCount = await prisma.organisation.count({ ...totalCountPrismaConditions });

    const enums = {};
    getAllEnumOptions("organisation", enums);

    return { organisationArray, organisationTotalCount, enums };
};

export const loadOrganisation = async (id = -1, relationshipOptions = true) => {
    const organisation = await prisma.organisation.findUnique({
        where: { id: id }
    });

    organisation.id = organisation.id.toString();

    const attributeNameTypeMap = getEntityAttributeUiTypes("organisation");

    for (const [key, val] of Object.entries(organisation)) {
        if (val && attributeNameTypeMap[key] === "date") {
            organisation[key] = formatISO(val, { representation: "date" });
        }

        if (val && attributeNameTypeMap[key] === "datetime-local") {
            organisation[key] = format(val, "yyyy-MM-dd'T'hh:mm");
        }
    }

    for (const [relatedEntityName, relationshipNames] of Object.entries(getRelationships("organisation"))) {
        for (const relationshipName of relationshipNames) {
            organisation[getSqlFromCamelCase(relationshipName)] = organisation[getSqlFromCamelCase(relationshipName)]?.toString();
        }
    }

    let returnObject = { organisation };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getOrganisationRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData
    };

    if (getEntitiesRelatedTo("organisation").length === 0) return returnObject;

    const associatedData = await getOrganisationAssociatedData(organisation?.id);
    returnObject = {
        ...returnObject,
        ...associatedData
    };

    return returnObject;
};

export const createOrganisation = async (data) => {
    const relationships = getRelatedEntities("organisation");
    const attributeNameTypeMap = getEntityAttributeUiTypes("organisation");

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

    await prisma.organisation.create({ data });
};

export const updateOrganisation = async (data) => {
    const relationships = getRelatedEntities("organisation");
    const attributeNameTypeMap = getEntityAttributeUiTypes("organisation");

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

    await prisma.organisation.update({
        data,
        where: { id: data.id }
    });
};

export const deleteOrganisation = async (id = -1) => {
    await prisma.organisation.delete({ where: { id } });
};

export const getOrganisationRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.parentOrganisationIdOptions = await getParentOrganisationIdOptions();
    return relationshipData;
};

export const getOrganisationAssociatedData = async (organisationId) => {
    const associatedData = {};

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getParentOrganisationIdOptions = async () => {
    const parentOrganisationIdArray = await prisma.parent_organisation.findMany({
        take: RELATIONSHIP_LOAD_LIMIT
    });

    const parentOrganisationIdOptions = parentOrganisationIdArray.map((parent_organisation_id) => {
        parent_organisation_id.id = parent_organisation_id.id.toString();
        return parent_organisation_id;
    });

    return parentOrganisationIdOptions;
};

//#endregion RelatedEntity / AssociatedEntity Helpers
