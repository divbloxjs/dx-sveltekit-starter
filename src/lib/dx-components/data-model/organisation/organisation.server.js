import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities } from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["effort", "isDefault", "description", "organisationName"]
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadOrganisationArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("organisation");
    const prismaConditions = getPrismaConditions("organisation", searchConfig, constraints);

    const organisationArray = await prisma.organisation.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions
    });

    try {
        normalizeDatabaseArray(organisationArray);
    } catch (err) {
        console.error(err);
    }

    return { organisationArray };
};

export const createOrganisation = async (data) => {
    try {
        await prisma.organisation.create({ data });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const updateOrganisation = async (data) => {
    const relationships = getRelatedEntities("organisation");

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
        const result = await prisma.organisation.update({
            data,
            where: { id: data.id }
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const deleteOrganisation = async (id = -1) => {
    try {
        await prisma.organisation.delete({ where: { id } });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

export const loadOrganisation = async (id = -1, relationshipOptions = true) => {
    const organisation = await prisma.organisation.findUnique({
        where: { id: id }
    });

    organisation.id = getIntId(organisation.id);
    Object.keys(getRelatedEntities("organisation")).forEach((relationshipName) => {
        organisation[relationshipName] = getIntId(organisation[relationshipName]);
    });

    const returnObject = { organisation };
    if (!relationshipOptions) return returnObject;

    	returnObject.placeOptions = await getPlaceOptions();
	returnObject.parentOrganisationOptions = await getParentOrganisationOptions();
;

    if (getEntitiesRelatedTo("organisation").length === 0) return returnObject;

    returnObject.associatedEntities = {};
    	returnObject.associatedEntities.customer = await getAssociatedCustomerArray(organisation.id);
;

    return returnObject;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getPlaceOptions = async () => {
    const placeArray = await prisma.place.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const placeOptions = placeArray.map((place) => {
        place.id = place.id.toString();
        return place;
    });

    return placeOptions;
};
const getParentOrganisationOptions = async () => {
    const parentOrganisationArray = await prisma.parentOrganisation.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const parentOrganisationOptions = parentOrganisationArray.map((parentOrganisation) => {
        parentOrganisation.id = parentOrganisation.id.toString();
        return parentOrganisation;
    });

    return parentOrganisationOptions;
};
;
const getAssociatedCustomerArray = async (organisationId) => {
    const customerArray = await prisma.customer.findMany({
        where: { organisationId: organisationId },
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    return customerArray;
};
;

//#endregion RelatedEntity / AssociatedEntity Helpers
