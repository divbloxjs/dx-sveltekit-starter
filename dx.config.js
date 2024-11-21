// Every property can be overwritten by node ENV variables of the same name
export default {
    webFramework: "sveltekit",
    dxApiKey: "d405a30d05b130e21bed5b544027672f", // FOR PUBLIC USE (PULL ONLY) - UPDATE THIS TO YOUR OWN API KEY
    environment: "local", // Current environment,
    dataModelPath: "divblox/configs/datamodel.json", // Path from route to the data model JSON file
    databaseConfigPath: "divblox/configs/database.config.js", // Path from root to the database configuration file
    databaseCaseImplementation: "snakecase", // Allowed options ['snakecase'|'camelcase'|'pascalcase']
    /** Supported options ['none','prisma'];
        If defined, the relevant orm will automatically bedatabase.config.js
        installed and used for things like component generation 
    */
    ormImplementation: "prisma",
    codeGen: {
        uiImplementation: "shadcn", // Supported options: ['none', 'tailwindcss', 'shadcn']
        dataModelUiConfigPath: "divblox/code-gen/datamodel-ui.config.json", // Path from route to the data model UI configuration file
        componentsPath: {
            fromRoot: "/src/lib/components/data-model", // Path to the folder to generate data-model components in
            alias: "$lib/components/data-model" // Aliased path to the folder to generate data-model components in
        },
        routesPath: {
            fromRoot: "/src/routes/(web)", // Path to the folder to generate routes in
            alias: "$src/routes/(web)" // Aliased path to the folder to generate routes in
        }
    }
};
