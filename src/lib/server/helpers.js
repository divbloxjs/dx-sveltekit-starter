const { createHash } = await import("node:crypto");

export const getGuid = () => {
    const guidRaw = Date.now().toString() + Math.round(1000000 * Math.random()).toString();
    return createHash("md5").update(guidRaw).digest("hex");
};
