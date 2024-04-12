// Every property can be overwritten by node ENV variables of the same name
export default {
    webFramework: "sveltekit",
    dxApiKey: "d405a30d05b130e21bed5b544027672f", // Divblox API key used to access resources stored there
    environment: "local", // Current environment,
    dataModelPath: "divblox/configs/datamodel.json", // Path from route to the data model JSON file
    databaseConfigPath: "divblox/configs/database.config.js", // Path from root to the database configuration file
    databaseCaseImplementation: "camelcase", // Allowed options ['snakecase'|'camelcase'|'pascalcase']
    ormImplementation: "prisma", // Supported options ['none','prisma']; If defined, the relevant orm will automatically be installed and used for things like component generation
    codeGen: {
        dataModelUiConfigPath: "divblox/code-gen/datamodel-ui.config.json", // Path from route to the data model UI configuration file
        componentsPath: { fromRoot: "/src/lib/dx-components", alias: "$lib/dx-components" },
        routesPath: { fromRoot: "/src/routes", alias: "$src/routes" },
        uiImplementation: "none"
    }
};
