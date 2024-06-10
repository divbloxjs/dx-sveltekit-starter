// Every property can be overwritten by node ENV variables of the same name
export default {
    webFramework: "sveltekit",
    // dxApiKey: "d405a30d05b130e21bed5b544027672f", //USE THIS FOR PUBLIC (PULL ONLY)
    dxApiKey: "e9e033108ed4c26c1a1a84669eace67c",
    environment: "local", // Current environment,
    dataModelPath: "divblox/configs/datamodel.json", // Path from route to the data model JSON file
    databaseConfigPath: "divblox/configs/database.config.js", // Path from root to the database configuration file
    databaseCaseImplementation: "camelcase", // Allowed options ['snakecase'|'camelcase'|'pascalcase']
    ormImplementation: "prisma", // Supported options ['none','prisma']; If defined, the relevant orm will automatically be installed and used for things like component generation
    codeGen: {
        dataModelUiConfigPath: "divblox/code-gen/datamodel-ui.config.json", // Path from route to the data model UI configuration file
        componentsPath: { fromRoot: "/src/lib/components", alias: "$lib/components" },
        routesPath: { fromRoot: "/src/routes", alias: "$src/routes" },
        uiImplementation: "shadcn"
    }
};
