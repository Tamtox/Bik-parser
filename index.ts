import * as http from 'http';
import { createWriteStream, createReadStream } from 'fs';
import { rm, readFile } from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import * as iconv from 'iconv-lite';
let AdmZip = require("adm-zip");

const currentPath = path.join(__dirname);

async function parseBik() {
  try {
    // Download and save archive
    const res = await fetch(`https://www.cbr.ru/vfs/mcirabis/BIKNew/20230221ED01OSBR.zip`);
    if (!res.ok || !res.body) throw new Error(`unexpected response ${res.statusText}`);
    let resReadStream = res.body.pipe(createWriteStream(`${currentPath}/assets/archive.zip`));
    await new Promise((resolve, reject) => {
      resReadStream.on('finish', () => {
        resolve("Done");
      }).on('error', (err) => {
        reject(err);
      })
    });
    // Extract and delete archive
    const archive = new AdmZip(`${currentPath}/assets/archive.zip`);
    // const entries = archive.getEntries();
    // for (let entry of entries) {
    //   const buffer = entry.getData();
    //   console.dir("\n" + buffer.toString("utf-8") + "\n");
    // }
    archive.extractAllTo(`${currentPath}/assets`);
    await rm(`${currentPath}/assets/archive.zip`, { recursive: true });
    // Parse XML file
    const fileBuffer = await readFile(`${currentPath}/assets/20230221_ED807_full.xml`);
    const data = iconv.decode(fileBuffer, 'win1251');
    console.log(data);
  } catch (err) {
    return console.error(err);
  }
}
parseBik();


