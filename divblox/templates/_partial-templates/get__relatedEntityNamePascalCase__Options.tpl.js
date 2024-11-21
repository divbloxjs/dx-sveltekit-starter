/**
 * @return {Promise<any[]>}
 */
const get__relationshipNamePascalCase__Options = async () => {
    const __relationshipName__Array = await prisma.__relatedEntityNameSqlCase__.findMany({
        select: { id: true },
        take: RELATIONSHIP_LOAD_LIMIT
    });

    return __relationshipName__Array;
};
