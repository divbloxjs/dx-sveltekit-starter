// This file is specific to the environment you are deploying to
export default {
    // The Divblox data modeller uses the concept of modules that allows you
    // to create tables grouped into different schemas on the same database server
    modules: [{ moduleName: "main", schemaName: "dx-sveltekit-starter" }],
    host: "localhost",
    user: "dxuser",
    password: "secret",
    port: 3308, // We set this to the non standard port 3308 instead of 3306 to speed up the process of getting started. Feel free to change.
    ssl: false
};
