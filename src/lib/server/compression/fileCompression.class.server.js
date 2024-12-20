export class FileCompression {
    #configuration = {
        original: {}
    };

    constructor() {
        // Can implement variability with how to compress images
    }
    /**
     * @typedef {Object} filesToReturn
     * @property {Buffer} original
     */

    /**
     *
     * @param {*} file
     * @returns
     */
    async getFinalFileSet(file) {
        const finalFiles = {};
        for (const [type, {}] of Object.entries(this.#configuration)) {
            finalFiles[type] = file;
        }

        return finalFiles;
    }
}
