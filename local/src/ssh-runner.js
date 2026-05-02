const fs = require("fs");
const path = require("path");
const { Client } = require("ssh2");

const shellQuote = (value) => {
    return `'${String(value).replace(/'/g, "'\\''")}'`;
};

const uploadFile = (sftp, localPath, remotePath) => {
    return new Promise((resolve, reject) => {
        sftp.fastPut(localPath, remotePath, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
};

const executeCommand = (conn, command) => {
    return new Promise((resolve, reject) => {
        conn.exec(command, (error, stream) => {
            if (error) {
                reject(error);
                return;
            }

            let output = "";

            stream.on("data", (data) => {
                output += data.toString();
            });

            stream.stderr.on("data", (data) => {
                output += data.toString();
            });

            stream.on("close", () => {
                resolve(output);
            });
        });
    });
};

const connectSsh = (config) => {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on("ready", () => resolve(conn));
        conn.on("error", reject);
        conn.connect({
            host: config.ssh.host,
            username: config.ssh.username,
            privateKey: fs.readFileSync(config.ssh.privateKeyPath)
        });
    });
};

const buildDockerCommand = ({ config, safeFileName, stdinFileName }) => {
    const volumeMount = `${config.remoteDirectory}:/app`;
    const pythonCommand = `python /app/${safeFileName} < /app/${stdinFileName}`;

    return [
        "docker run --rm -i",
        "-v",
        shellQuote(volumeMount),
        shellQuote(config.dockerImage),
        "sh -c",
        shellQuote(pythonCommand)
    ].join(" ");
};

const runPythonOverSsh = async ({
    config,
    safeFileName,
    stdinFileName,
    localFilePath,
    localStdinPath
}) => {
    const remoteFilePath = path.posix.join(config.remoteDirectory, safeFileName);
    const remoteStdinPath = path.posix.join(config.remoteDirectory, stdinFileName);
    const command = buildDockerCommand({ config, safeFileName, stdinFileName });
    const conn = await connectSsh(config);

    try {
        const sftp = await new Promise((resolve, reject) => {
            conn.sftp((error, sftpClient) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(sftpClient);
            });
        });

        await uploadFile(sftp, localFilePath, remoteFilePath);
        await uploadFile(sftp, localStdinPath, remoteStdinPath);

        return await executeCommand(conn, command);
    } finally {
        conn.end();
    }
};

module.exports = {
    runPythonOverSsh
};
