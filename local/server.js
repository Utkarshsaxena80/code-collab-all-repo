const express = require("express");
const { Client } = require("ssh2");
const fs = require("fs");

const app = express();

app.get("/run", (req, res) => {
    const conn = new Client();
    conn.on("ready", () => {
        conn.exec(
            'docker run --rm python:3.9-alpine python -c "print(\'Hello from EC2\')"',
            (err, stream) => {

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
            }
        );

    }).connect({
        host: "34.228.82.196",
        username: "ubuntu",
        privateKey: fs.readFileSync("./code-colab.pem")
    });

});

app.listen(3000, () => {
    console.log("server running on port 3000");
});