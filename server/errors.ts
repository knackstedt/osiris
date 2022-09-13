import { readFileSync, existsSync } from "fs";
import * as express from "express";

// const v8 = require('v8');
// v8.setFlagsFromString('--stack-size=256');

export const router = express.Router();

const isProduction = process.env["NODE_ENV"]?.toLowerCase() == "production";

const errorTemplate = readFileSync(__dirname + "/../static/message.html", "utf-8");

function renderStacktrace(stack) {
    const renderedLines = stack.split("\n").map((text, i) => {
        return `
        <div class="error-SourceLine">
            <a class="error-SourceLine-number error-SourceLine-number--highlight"></a>
            <div class="error-SourceLine-text error-SourceLine-text--highlight">${text}</div>
        </div>`;
    }).join("");

    return `
    <div class="error-NativeStackTrace">
        <div class="error-StackFrames">
            ${renderedLines}
        </div>
    </div>
    `;
}

function renderCodeFile(stack) {

    const fileRef = stack.match(/at [^(]+?\(([^)]+?)\)/)[1];
    const fileParts = fileRef.split(":");
    const filePath = fileParts[0];
    const lineNo = fileParts[1];
    const colNo = fileParts[2];
    const fileText = existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
    const fileLines = fileText.split("\n");

    if (!fileText) return "";

    const renderedLines = fileLines
        .slice(Math.max(lineNo - 4, 0), Math.max(lineNo + 10, fileLines.length)) // Get a subset of ~8 lines of code.
        .map((text, i) => {
            // Line numbers show 2 before and 6 after the affected line.
            // We add 1 here because line numbers in files start at index 1.
            const lineNumber = (lineNo - 4 + i) + 1;
            const isCurLine = lineNumber == lineNo;
            if (isCurLine) {

                const customLine = text.slice(0, colNo - 1) +
                    `<span class="marker">${text.charAt(Math.min(colNo - 1, text.length))}</span>` +
                    `<span class="marker-line">${text.slice(Math.min(colNo, text.length))}</span>`;

                return `
                <div class="error-SourceLine">
                    <a class="error-SourceLine-number error-SourceLine-number--highlight">${lineNumber}</a>
                    <div class="error-SourceLine-text error-SourceLine-text--highlight">${customLine}</div>
                </div>`;
            }
            else {
                return `
                <div class="error-SourceLine">
                    <a class="error-SourceLine-number error-SourceLine-number--highlight">${lineNumber}</a>
                    <div class="error-SourceLine-text error-SourceLine-text--highlight">${text}</div>
                </div>`;
            }
        }).join("");

    return `
    <div class="error-NativeStackTrace"><a class="error-NativeStackTrace-filename">${fileRef.split("/").pop()}</a>
        <div class="error-SourceLines">
            ${renderedLines}
        </div>
    </div>
    `;
}

function renderTemplate(data) {
    let substituted = errorTemplate;

    if (data.stack) {
        let stack = renderStacktrace(data.stack);
        substituted = substituted.replace("{{stacktrace}}", stack || "");

        let code = renderCodeFile(data.stack);
        substituted = substituted.replace("{{codeSnippet}}", code || "");
    }

    substituted = substituted.replace(/\{\{([a-zA-z0-9\-_]*?\.?([a-zA-z0-9\-_]*?))\}\}/g,
        (match, group1, group2, index) => {
            return data[group2] || "";
        });


    return substituted;
}

// Catch-all error handler.
export const ErrorHandler = (err, req, res, next) => {

    // Check request 'accept' header to see if there is a document request.
    const wantsHtml = /(text\/html|application\/xhtml\+xml)/.test(req.headers.accept);

    let jsonResult: any = {};

    switch (true) {
        case typeof err == 'number': {
            let message = {
                200: "Ok",
                201: "Created",
                202: "Accepted",
                204: "No Content",
                400: "Malformed Request",
                401: "Not Authorized",
                403: "Forbidden",
                404: "Not Found",
                405: "Method Not Allowed",
                408: "Request Timeout",
                422: "Unprocessable Entity"
            }[err];
            jsonResult = {
                status: err,
                message,
                name: "HTTP Error"
            }
            break;
        }
        case (typeof err == 'string'): {
            jsonResult = {
                name: "The server returned the following error",
                status: 500,
                message: err
            }
            break;
        }
        case (typeof err == 'object' && err.hasOwnProperty("isAxiosError")): {
            // let resBuf = err.response.data?.read();
            // let resText = resBuf?.toString();
            // let resJson = safeJsonParse(resText);
            let jsonError = err.toJSON();

            jsonResult = {
                name: err.statusText || "Axios Request Failed",
                title: err.response.statusText?.toString(),
                message: jsonError.message?.toString() || jsonError.body?.toString() || jsonError.content?.toString(),
                status:
                    (typeof jsonError.status == "number" && jsonError.status) ||
                    (typeof jsonError.code == "number" && jsonError.code) ||
                    (typeof err.response.status == "number" && err.response.status) ||
                    (typeof err.status == "number" && err.status) ||
                    (typeof err.code == "number" && err.code) ||
                    502,
                stack: jsonError.stack?.toString(),
                url: jsonError.config.url?.toString(),
                method: jsonError.config.method?.toString()
            }
            break;
        }
        case (typeof err == 'object'): {
            // General error handling
            jsonResult = {
                name: err.name?.toString() || "Request Failed",
                title: err.title?.toString() || "Failed to handle request",
                message: err.message?.toString() || (!err.stack && err.toString()) || "General Error",
                status:
                    (typeof err.response?.status == "number" && err.response?.status) ||
                    (typeof err.status == "number" && err.status) ||
                    (typeof err.code == "number" && err.code) ||
                    500,
                stack: err.stack?.toString()
            }
        }
    }

    if (!jsonResult.status) {
        jsonResult.status = 500;
        console.error("SEVERE: jsonResult status was never defined")
    }

    if (jsonResult.status >= 405) {
        if (jsonResult.constructor.name.endsWith("Error"))
            console.error(jsonResult);
        else
            console.error(`${jsonResult.name}\n${jsonResult.message}\n${jsonResult.stack}`);
    }

    if (jsonResult.status >= 500) {
        const log = `[${jsonResult.status}] ` + err.name;

        const error = err.name?.endsWith('Error') ?
            err.message + "\n" + err.stack :
            JSON.stringify(err)

        // The only reason we are using userInfo here is in case there is a failure
        // During the signon process.
        const email = req.session?.userInfo?.mail || req.session?.userInfo?.upn || "anonymous";
    }

    // Remove stacktrace information from the reported error in higher environments
    // Higher-level environments should not have code or stacktraces exposed.
    if (!req.session?.profile?.isAdmin && isProduction) {
        delete jsonResult.stack;  // Stacktrace includes code.
        delete jsonResult.url;    // Internally used url from Axios error.
        delete jsonResult.method; // Internally used method from Axios error.

        if (jsonResult.message.includes("ECONNREFUSED"))
            jsonResult.message = "Failed to connect to downstream provider";
    }

    res.status(jsonResult.status);
    res.send(wantsHtml ? renderTemplate(jsonResult) : jsonResult);
};
