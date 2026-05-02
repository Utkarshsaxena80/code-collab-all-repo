const { createApp } = require("./src/app");
const { loadConfig } = require("./src/config");

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, (error) => {
    if (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }

    console.log(`Server running on port ${config.port}`);
});
