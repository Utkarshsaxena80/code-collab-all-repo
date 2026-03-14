const express = require("express");
const { Client } = require("ssh2");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const EC2_HOST = "34.228.82.196";
const USER = "ubuntu";
const KEY = fs.readFileSync(path.join(__dirname, "code-colab.pem"));
const REMOTE_DIRECTORY = "/home/ubuntu";

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

const sanitizeFileName = (fileName = "test.py") => {
    const trimmedName = path.basename(String(fileName).trim());

    if (!trimmedName) {
        return "test.py";
    }

    return trimmedName.endsWith(".py") ? trimmedName : `${trimmedName}.py`;
};

const buildStdinFileName = (safeFileName) => {
    const baseName = safeFileName.replace(/\.py$/, "");
    return `${baseName}.stdin.txt`;
};

app.post("/run", async (req, res) => {
    const { code, fileName, stdin = "" } = req.body || {};

    if (!code || !String(code).trim()) {
        return res.status(400).json({ error: "Code is required." });
    }

    const safeFileName = sanitizeFileName(fileName);
    const stdinFileName = buildStdinFileName(safeFileName);
    const localFilePath = path.join(os.tmpdir(), safeFileName);
    const localStdinPath = path.join(os.tmpdir(), stdinFileName);
    const remoteFilePath = `${REMOTE_DIRECTORY}/${safeFileName}`;
    const remoteStdinPath = `${REMOTE_DIRECTORY}/${stdinFileName}`;
    const command = `docker run --rm -i -v ${REMOTE_DIRECTORY}:/app python:3.9-alpine sh -c "python /app/${safeFileName} < /app/${stdinFileName}"`;

    try {
        fs.writeFileSync(localFilePath, code, "utf8");
        fs.writeFileSync(localStdinPath, String(stdin), "utf8");

        const output = await new Promise((resolve, reject) => {
            const conn = new Client();

            conn.on("ready", () => {
                console.log("SSH connected");

                conn.sftp((err, sftp) => {
                    if (err) {
                        conn.end();
                        reject(err);
                        return;
                    }

                    sftp.fastPut(localFilePath, remoteFilePath, (uploadErr) => {
                        if (uploadErr) {
                            conn.end();
                            reject(uploadErr);
                            return;
                        }

                        sftp.fastPut(localStdinPath, remoteStdinPath, (stdinUploadErr) => {
                            if (stdinUploadErr) {
                                conn.end();
                                reject(stdinUploadErr);
                                return;
                            }

                            console.log("Files uploaded");

                            conn.exec(command, (execErr, stream) => {
                                if (execErr) {
                                    conn.end();
                                    reject(execErr);
                                    return;
                                }

                                let executionOutput = "";

                                stream.on("data", (data) => {
                                    executionOutput += data.toString();
                                });

                                stream.stderr.on("data", (data) => {
                                    executionOutput += data.toString();
                                });

                                stream.on("close", () => {
                                    conn.end();
                                    resolve(executionOutput);
                                });
                            });
                        });
                    });
                });
            }).on("error", reject).connect({
                host: EC2_HOST,
                username: USER,
                privateKey: KEY
            });
        });

        return res.json({ output });
    } catch (error) {
        return res.status(500).json({
            error: error.message || "Failed to run code."
        });
    } finally {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        if (fs.existsSync(localStdinPath)) {
            fs.unlinkSync(localStdinPath);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
