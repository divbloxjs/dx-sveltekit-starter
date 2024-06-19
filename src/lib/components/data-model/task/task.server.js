import { prisma } from "$lib/server/prisma-instance";
import { isNumeric } from "dx-utilities";
import { getIntId, normalizeDatabaseArray } from "../_helpers/helpers";
import { getEntitiesRelatedTo, getRelatedEntities, getEntityAttributeUiTypes } from "../_helpers/helpers.server";
import { getPrismaSelectAllFromEntity, getPrismaConditions, getSqlCase } from "$lib/server/prisma.helpers";

const RELATIONSHIP_LOAD_LIMIT = 50;

const searchConfig = {
    attributes: ["status", "dueDate", "taskName", "description"],
    // relationships: {
    //     relatedEntityName: { attributes: [] }
    // }
};

export const loadTaskArray = async (constraints = {}) => {
    const selectClause = getPrismaSelectAllFromEntity("task");
    const prismaConditions = getPrismaConditions("task", searchConfig, constraints);

    const taskArray = await prisma.task.findMany({
        // relationLoadStrategy: 'join', // or "query"
        select: selectClause,
        ...prismaConditions,
    });

    normalizeDatabaseArray(taskArray);

    return { taskArray };
};

export const createTask = async (data) => {
    const relationships = getRelatedEntities("task");
    const attributeNameTypeMap = getEntityAttributeUiTypes("task");

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
    });

    await prisma.task.create({ data });
};

export const updateTask = async (data) => {
    const relationships = getRelatedEntities("task");
    const attributeNameTypeMap = getEntityAttributeUiTypes("task");

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
    });

    await prisma.task.update({
        data,
        where: { id: data.id },
    });
};

export const deleteTask = async (id = -1) => {
    await prisma.task.delete({ where: { id } });
};

export const loadTask = async (id = -1, relationshipOptions = true) => {
    const task = await prisma.task.findUnique({
        where: { id: id },
    });

    task.id = task.id.toString();
    Object.keys(getRelatedEntities("task")).forEach((relationshipName) => {
        task[getSqlCase(`${relationshipName}Id`)] =
            task[getSqlCase(`${relationshipName}Id`)]?.toString();
    });

    let returnObject = { task };
    if (!relationshipOptions) return returnObject;

    const relationshipData = await getTaskRelationshipData();
    returnObject = {
        ...returnObject,
        ...relationshipData,
    };

    if (getEntitiesRelatedTo("task").length === 0) return returnObject;

    const associatedData = await getTaskAssociatedData(task?.id);
    returnObject = {
        ...returnObject,
        ...associatedData,
    };

    return returnObject;
};

export const getTaskRelationshipData = async () => {
    const relationshipData = {};

    relationshipData.categoryOptions = await getCategoryOptions();
relationshipData.userAccountOptions = await getUserAccountOptions();
;

    return relationshipData;
};

export const getTaskAssociatedData = async (taskId) => {
    const associatedData = {};

    ;

    return associatedData;
};

//#region RelatedEntity / AssociatedEntity Helpers

const getCategoryOptions = async () => {
    const categoryArray = await prisma.category.findMany({
        take: RELATIONSHIP_LOAD_LIMIT,
    });

    const categoryOptions = categoryArray.map((category) => {
        category.id = category.id.toString();
        return category;
    });

    return categoryOptions;
};
const getUserAccountOptions = async () => {
    const userAccountArray = await prisma.user_account.findMany({
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
