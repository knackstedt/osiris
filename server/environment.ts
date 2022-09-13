import { existsSync, readFileSync } from "fs";

// Recursively load and seal environment from env vars.
function writeSealed<T = any>(obj: T, original: T, path = ""): T {
    let data = obj as any;
    const sealed: any = Array.isArray(data) ? [] : {};

    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (typeof data[key] == "object") {
            sealed[key] = writeSealed(data[key], original, path + key + "_");
        }
        else {
            let value = process.env[path + key] || data[key];

            value = typeof value == 'string' ? value.replace(/\$\{([A-Za-z0-9\-_]+?)\}/g, (match: string, capture: string, index: number, originalString: string) => {
                return process.env[capture] || process.env[capture.replace(/\./g, "_")];
            }) : value;

            sealed[key] = value;
        }
    }

    return Object.seal(sealed) as T;
}

function sealEnvironmentProps<T = any>(object: T): T {
    return writeSealed(object, object);
}

const domain = process.env["Domain"] || "localhost:4200";
export const environment = sealEnvironmentProps({
    isProduction: false,
    port: 3000,
    domain: domain,
});
