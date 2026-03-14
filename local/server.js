const express = require("express");
const { Client } = require("ssh2");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
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

app.post("/run", async (req, res) => {
    const { code, fileName } = req.body || {};

    if (!code || !String(code).trim()) {
        return res.status(400).json({ error: "Code is required." });
    }

    const safeFileName = sanitizeFileName(fileName);
    const localFilePath = path.join(os.tmpdir(), safeFileName);
    const remoteFilePath = `${REMOTE_DIRECTORY}/${safeFileName}`;
    const command = `docker run --rm -v ${REMOTE_DIRECTORY}:/app python:3.9-alpine python /app/${safeFileName}`;

    try {
        fs.writeFileSync(localFilePath, code, "utf8");

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

                        console.log("File uploaded");

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
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
