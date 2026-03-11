const express = require("express");
const { Client } = require("ssh2");
const fs = require("fs");
const app = express();
const EC2_HOST = "34.228.82.196";
const USER = "ubuntu";
const KEY = fs.readFileSync("./code-colab.pem");
const LOCAL_FILE = "./test.py";
const REMOTE_FILE = "/home/ubuntu/test.py";
app.get("/run", (req, res) => {
    const conn = new Client();
    conn.on("ready", () => {
        console.log("SSH connected");
        conn.sftp((err, sftp) => {
            if (err) {
                res.send(err);
                return;
            }
            
            sftp.fastPut(LOCAL_FILE, REMOTE_FILE, (err) => {
                if (err) {
                    res.send("Upload failed: " + err);
                    return;
                }

                console.log("File uploaded");

                const command =
                    "docker run --rm -v /home/ubuntu:/app python:3.9-alpine python /app/test.py";

                conn.exec(command, (err, stream) => {

                    if (err) {
                        res.send(err);
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
                        conn.end();
                        res.send(output);
                    });

                });

            });

        });

    }).connect({
        host: EC2_HOST,
        username: USER,
        privateKey: KEY
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});