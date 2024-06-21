import dataModel from "datamodel";
import { isEmptyObject, getCamelCaseSplittedToLowerCase, convertLowerCaseToPascalCase, convertLowerCaseToCamelCase } from "dx-utilities";
import dxConfig from "../../../dx.config";
import { getEntityAttributes } from "$components/data-model/_helpers/helpers.server";

export const getPrismaSelectAllFromEntity = (entityName, select = {}) => {
    if (isEmptyObject(select)) select.id = true;

    // Add all attributes
    Object.keys(dataModel[entityName].attributes).forEach((attributeName) => {
        select[getSqlCase(attributeName)] = true;
    });

    // Nested add all relationships

    for (const [relatedEntity, relationshipNames] of Object.entries(dataModel[entityName].relationships)) {
        select[getSqlCase(relatedEntity)] = { select: {} };

        getPrismaSelectAllFromEntity(relatedEntity, select[getSqlCase(relatedEntity)].select);
    }

    return select;
};

export const getPrismaConditions = (entityName = "", searchConfig = {}, constraints = {}) => {
    const prismaConditions = {};

    if (constraints.limit) {
        prismaConditions.take = constraints.limit;
    }

    if (constraints.offset) {
        prismaConditions.skip = constraints.offset;
    }

    if (constraints.sort) {
        prismaConditions.orderBy = [];
        Object.keys(constraints.sort).forEach((attributeName) => {
            const obj = {};
            obj[attributeName] = constraints.sort[attributeName];
            prismaConditions.orderBy.push(obj);
        });
    }

    if (constraints.search) {
        if (!prismaConditions.where) prismaConditions.where = {};

        const attributes = getEntityAttributes(entityName);
        searchConfig.attributes.forEach((attributeName) => {
            let searchValue = constraints.search;
            if (!Object.keys(attributes).includes(attributeName)) {
                console.error("Invalid search attribute provided: ", attributeName);
                return;
            }

            if (!prismaConditions.where.OR) prismaConditions.where.OR = [];

            if (attributes[attributeName].type.toLowerCase() === "date" || attributes[attributeName].type.toLowerCase() === "datetime") {
                console.error("Date/Datetime attributes are forcefully removed from search condition: ", attributeName);
                return;
            }

            if (attributes[attributeName].type.toLowerCase() === "json") {
                console.error("JSON attributes are forcefully removed from search condition: ", attributeName);
                return;
            }

            let comparisonOperation = "contains"; // For string attributes
            if (
                attributes[attributeName].type.toLowerCase().includes("int") ||
                attributes[attributeName].type.toLowerCase() === "double" ||
                attributes[attributeName].type.toLowerCase() === "float"
            ) {
                // For numeric attributes
                comparisonOperation = "equals";
                searchValue = Number(constraints.search);
            }

            prismaConditions.where.OR.push({ [getSqlCase(attributeName)]: { [comparisonOperation]: searchValue } });
        });

        Object.keys(searchConfig.relationships ?? []).forEach((entityName) => {
            const attributes = getEntityAttributes(entityName);

            if (!prismaConditions.where.OR) prismaConditions.where.OR = [];

            const relationshipConstraint = { [getSqlCase(entityName)]: {} };

            searchConfig.relationships[entityName].attributes.forEach((attributeName) => {
                if (
                    attributes[attributeName].type.toLowerCase() === "date" ||
                    attributes[attributeName].type.toLowerCase() === "datetime"
                ) {
                    console.error("Date/Datetime attributes are forcefully removed from search condition: ", attributeName);
                    return;
                }

                if (attributes[attributeName].type.toLowerCase() === "json") {
                    console.error("JSON attributes are forcefully removed from search condition: ", attributeName);
                    return;
                }

                let comparisonOperation = "contains"; // For string attributes
                if (
                    attributes[attributeName].type.toLowerCase().includes("int") ||
                    attributes[attributeName].type.toLowerCase() === "double" ||
                    attributes[attributeName].type.toLowerCase() === "float"
                ) {
                    // For numeric attributes
                    comparisonOperation = "equals";
                    searchValue = Number(constraints.search);
                }

                relationshipConstraint[getSqlCase(entityName)][getSqlCase(attributeName)] = { contains: constraints.search };
            });

            prismaConditions.where.OR.push(relationshipConstraint);
        });
    }

    if (constraints.filter) {
        prismaConditions.where = {};
        convertFilterClauseToPrismaClause(constraints.filter, prismaConditions.where);
    }

    return prismaConditions;
};

const convertFilterClauseToPrismaClause = (filterConstraint = {}, prismaFilterConditions = {}) => {
    Object.keys(filterConstraint).forEach((filterValue) => {
        prismaFilterConditions[filterValue] = {};

        const depth = getObjectDepth(filterConstraint[filterValue]);
        if (depth > 1) {
            // Nested relationship
            convertFilterClauseToPrismaClause(filterConstraint[filterValue], prismaFilterConditions[filterValue], filterValue);
            return;
        }

        Object.keys(filterConstraint[filterValue]).forEach((condition) => {
            let prismaCondition = condition;

            if (condition === "eq") prismaCondition = "equals";
            if (condition === "ne") prismaCondition = "not";
            if (condition === "like") prismaCondition = "contains";

            prismaFilterConditions[filterValue][prismaCondition] = filterConstraint[filterValue][condition];
        });
    });
};

/**
 * Returns the integer value of the depth of the provided object
 * @param {Object} objectToCheck NOTE: Recursive object will BREAK
 * TODO: Add to dx-utilities
 * @returns {number}
 */
const getObjectDepth = (objectToCheck) => {
    return Object(objectToCheck) === objectToCheck ? 1 + Math.max(-1, ...Object.values(objectToCheck).map(getObjectDepth)) : 0;
};

export const getSqlCase = (inputString = "", databaseCaseImplementation = dxConfig.databaseCaseImplementation) => {
    let preparedString = inputString;
    switch (databaseCaseImplementation.toLowerCase()) {
        case DB_IMPLEMENTATION_TYPES.SNAKE_CASE:
            return getCamelCaseSplittedToLowerCase(inputString, "_");
        case DB_IMPLEMENTATION_TYPES.PASCAL_CASE:
            preparedString = getCamelCaseSplittedToLowerCase(inputString, "_");
            return convertLowerCaseToPascalCase(preparedString, "_");
        case DB_IMPLEMENTATION_TYPES.CAMEL_CASE:
            preparedString = getCamelCaseSplittedToLowerCase(inputString, "_");
            return convertLowerCaseToCamelCase(preparedString, "_");
        default:
            return getCamelCaseSplittedToLowerCase(inputString, "_");
    }
};

export const DB_IMPLEMENTATION_TYPES = { SNAKE_CASE: "snakecase", PASCAL_CASE: "pascalcase", CAMEL_CASE: "camelcase" };
