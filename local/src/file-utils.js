const fs = require("fs");
const os = require("os");
const path = require("path");

const DEFAULT_FILE_NAME = "test.py";

const sanitizeFileName = (fileName = DEFAULT_FILE_NAME) => {
    const baseName = path.basename(String(fileName).trim()) || DEFAULT_FILE_NAME;
    const pythonName = baseName.endsWith(".py") ? baseName : `${baseName}.py`;
    const safeName = pythonName.replace(/[^a-zA-Z0-9._-]/g, "_");

    return safeName || DEFAULT_FILE_NAME;
};

const buildStdinFileName = (safeFileName) => {
    const baseName = safeFileName.replace(/\.py$/, "");
    return `${baseName}.stdin.txt`;
};

const removeIfExists = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const createExecutionFiles = ({ code, fileName, stdin }) => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "code-run-"));
    const safeFileName = sanitizeFileName(fileName);
    const stdinFileName = buildStdinFileName(safeFileName);
    const localFilePath = path.join(tempDirectory, safeFileName);
    const localStdinPath = path.join(tempDirectory, stdinFileName);

    fs.writeFileSync(localFilePath, String(code), "utf8");
    fs.writeFileSync(localStdinPath, String(stdin || ""), "utf8");

    return {
        safeFileName,
        stdinFileName,
        localFilePath,
        localStdinPath,
        cleanup: () => {
            removeIfExists(localFilePath);
            removeIfExists(localStdinPath);

            if (fs.existsSync(tempDirectory)) {
                fs.rmdirSync(tempDirectory);
            }
        }
    };
};

module.exports = {
    createExecutionFiles,
    sanitizeFileName
};
