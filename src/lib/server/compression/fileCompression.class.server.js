export class FileCompression {
    #configuration= {
        original: {}
    }

    constructor() {
        // Can implement variability with how to compress images
    }

    async getAllFiles(file) {
        return {[Object.keys(this.#configuration)[0]]: file}
    }
}
