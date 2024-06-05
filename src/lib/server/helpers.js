const { createHash } = await import("node:crypto");

/**
 * Helper function that returns a time-based unique 32-char GUID
 * @returns {string} 32-character md5 hash of a pseudo-random base
 */
export const getGuid = () => {
    const guidRaw = Date.now().toString() + Math.round(1000000 * Math.random()).toString();
    return createHash("md5").update(guidRaw).digest("hex");
};
