"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = __importDefault(require("path"));
const iconv = __importStar(require("iconv-lite"));
let AdmZip = require("adm-zip");
const currentPath = path_1.default.join(__dirname);
async function parseBik() {
    try {
        // Download and save archive
        const res = await (0, node_fetch_1.default)(`https://www.cbr.ru/vfs/mcirabis/BIKNew/20230221ED01OSBR.zip`);
        if (!res.ok || !res.body)
            throw new Error(`unexpected response ${res.statusText}`);
        let resReadStream = res.body.pipe((0, fs_1.createWriteStream)(`${currentPath}/assets/archive.zip`));
        await new Promise((resolve, reject) => {
            resReadStream.on('finish', () => {
                resolve("Done");
            }).on('error', (err) => {
                reject(err);
            });
        });
        // Extract and delete archive
        const archive = new AdmZip(`${currentPath}/assets/archive.zip`);
        // const entries = archive.getEntries();
        // for (let entry of entries) {
        //   const buffer = entry.getData();
        //   console.dir("\n" + buffer.toString("utf-8") + "\n");
        // }
        archive.extractAllTo(`${currentPath}/assets`);
        await (0, promises_1.rm)(`${currentPath}/assets/archive.zip`, { recursive: true });
        // Parse XML file
        const fileBuffer = await (0, promises_1.readFile)(`${currentPath}/assets/20230221_ED807_full.xml`);
        const data = iconv.decode(fileBuffer, 'win1251');
        console.log(data);
    }
    catch (err) {
        return console.error(err);
    }
}
parseBik();
