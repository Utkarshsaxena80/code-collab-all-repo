const express = require("express");
const { createExecutionFiles } = require("./file-utils");
const { runPythonOverSsh } = require("./ssh-runner");

const createApp = (config) => {
    const app = express();

    app.use(express.json({ limit: "1mb" }));
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "POST, OPTIONS");

        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        }

        return next();
    });

    app.post("/run", async (req, res) => {
        const { code, fileName, stdin = "" } = req.body || {};

        if (!code || !String(code).trim()) {
            return res.status(400).json({ error: "Code is required." });
        }

        const executionFiles = createExecutionFiles({ code, fileName, stdin });

        try {
            const output = await runPythonOverSsh({
                config,
                safeFileName: executionFiles.safeFileName,
                stdinFileName: executionFiles.stdinFileName,
                localFilePath: executionFiles.localFilePath,
                localStdinPath: executionFiles.localStdinPath
            });

            return res.json({ output });
        } catch (error) {
            return res.status(500).json({
                error: error.message || "Failed to run code."
            });
        } finally {
            executionFiles.cleanup();
        }
    });

    return app;
};

module.exports = {
    createApp
};
