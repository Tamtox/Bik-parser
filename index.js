"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
async function parseBik(url) {
    const result = [];
    try {
        // Check folder
        const folderName = `${currentPath}/archive`;
        if (!(0, fs_1.existsSync)(folderName)) {
            (0, fs_1.mkdirSync)(folderName);
        }
        // Download and save archive
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok || !res.body)
            throw new Error(`unexpected response ${res.statusText}`);
        let resReadStream = res.body.pipe((0, fs_1.createWriteStream)(`${folderName}/archive.zip`));
        await new Promise((resolve, reject) => {
            resReadStream.on('finish', () => {
                resolve("Done");
            }).on('error', (err) => {
                reject(err);
            });
        });
        // Extract XML and delete archive
        const archive = new AdmZip(`${folderName}/archive.zip`);
        archive.extractAllTo(`${folderName}`);
        await (0, promises_1.rm)(`${folderName}/archive.zip`, { recursive: true });
        // Parse XML file
        const dataBuffer = await (0, promises_1.readFile)(`${folderName}/20230221_ED807_full.xml`);
        const cyrillicDecoded = iconv.decode(dataBuffer, 'win1251');
        console.log(cyrillicDecoded);
        // Delete folder
        await (0, promises_1.rm)(`${folderName}`, { recursive: true });
    }
    catch (err) {
        return console.error(err);
    }
    return result;
}
const url = `https://www.cbr.ru/vfs/mcirabis/BIKNew/20230221ED01OSBR.zip`;
parseBik(url);
