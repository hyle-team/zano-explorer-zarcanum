// import express, { Request, Response } from "express";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";

const express = require("express");
// const { Request, Response } = require("express");
const path = require("path");
const { dirname } = require("path");
const { fileURLToPath } = require("url");

const PORT = 3005;

// const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const app = express();
    app.use(express.static("./build"));

    app.all(["/proxy/*"], async (req: any, res: any) => {
        try {
            const result = await fetch('https://explorer.zano.org' + req.url.replace("/proxy", ""));
            try {
                const json = await result.json();
                res.status(200).send(json);
            } catch {
                res.status(404).send({ success: false, error: "Not found" })
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Proxy server error' });
        }
    });

    app.get("/*", (req: any, res: any) => {
        res.sendFile(path.resolve(__dirname, "../build/index.html"))
    });
   
    app.listen(PORT, () => console.log("Server started at port " + PORT));
}

main();