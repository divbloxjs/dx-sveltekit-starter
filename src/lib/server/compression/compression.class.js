export class CompressionBase {
    #configuration = {
        original: {}
    };

    constructor() {
        // Can implement variability with how to compress images
    }

    /**
     * Returns the final set of files for the provided file
     * Default FinalSet is just a single file: { original: file }
     * @param {File|Buffer|ArrayBuffer} file
     * @returns {Promise<Object>}
     */
    async getFinalFileSet(file) {
        const finalFiles = {};
        for (const [type, {}] of Object.entries(this.#configuration)) {
            finalFiles[type] = file;
        }

        return finalFiles;
    }
}
