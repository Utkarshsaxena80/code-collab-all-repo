const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const REQUIRED_ENV_VARS = [
    "SSH_HOST",
    "SSH_USERNAME",
    "SSH_PRIVATE_KEY_PATH",
    "REMOTE_DIRECTORY",
    "DOCKER_IMAGE"
];

const getRequiredEnv = (name) => {
    const value = process.env[name];

    if (!value || !value.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value.trim();
};

const resolveFromProjectRoot = (filePath) => {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }

    return path.resolve(__dirname, "..", filePath);
};

const normalizeRemoteDirectory = (remoteDirectory) => {
    const normalized = remoteDirectory.replace(/\/+$/, "");
    return normalized || "/";
};

const loadConfig = () => {
    REQUIRED_ENV_VARS.forEach(getRequiredEnv);

    const port = Number(process.env.PORT || 3001);

    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("PORT must be a positive integer.");
    }

    const privateKeyPath = resolveFromProjectRoot(getRequiredEnv("SSH_PRIVATE_KEY_PATH"));

    if (!fs.existsSync(privateKeyPath)) {
        throw new Error(`SSH private key file does not exist: ${privateKeyPath}`);
    }

    return {
        port,
        ssh: {
            host: getRequiredEnv("SSH_HOST"),
            username: getRequiredEnv("SSH_USERNAME"),
            privateKeyPath
        },
        remoteDirectory: normalizeRemoteDirectory(getRequiredEnv("REMOTE_DIRECTORY")),
        dockerImage: getRequiredEnv("DOCKER_IMAGE")
    };
};

module.exports = {
    loadConfig
};
