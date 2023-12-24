const java = require("java");

const {generateResume, formats, defaultResume} = require("./helpers");
java.classpath.push("src/aspose-words.jar");
java.classpath.push("src");
const MyClass = java.import("Office2Pdf");
import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));
router.get('/convert', (req, res) => {
    const format = req?.query?.format || "html";
    const resume = JSON.parse(req?.query?.resume) || defaultResume;
    const doc = generateResume(resume)
    const result = MyClass.convertSync(doc, format);
    let content = 'unknown format';
    if(format === "html") {
        content = Buffer.from(result, 'base64').toString('utf-8');
    } else {
        content = Buffer.from(result, 'base64');
        res.setHeader('Content-Length', content.length);
        res.setHeader('Content-Type', formats[format]);
        res.setHeader('Content-Disposition', `attachment; filename=resume.${format}`);
    }
    res.send(content)
})
api.use("/api/", router);

export const handler = serverless(api);

