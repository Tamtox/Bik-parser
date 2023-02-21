import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { rm, readFile, access } from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import * as iconv from 'iconv-lite';
let AdmZip = require("adm-zip");

const currentPath = path.join(__dirname);

interface IAccountInfo {
  bic: number;
  name: string;
  corrAccount: number;
}


async function parseBik(url: string) {
  const result: IAccountInfo[] = [];
  try {
    // Check folder
    const folderName = `${currentPath}/archive`;
    if (!existsSync(folderName)) {
      mkdirSync(folderName);
    }
    // Download and save archive
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`unexpected response ${res.statusText}`);
    let resReadStream = res.body.pipe(createWriteStream(`${folderName}/archive.zip`));
    await new Promise((resolve, reject) => {
      resReadStream.on('finish', () => {
        resolve("Done");
      }).on('error', (err) => {
        reject(err);
      })
    });
    // Extract XML and delete archive
    const archive = new AdmZip(`${folderName}/archive.zip`);
    archive.extractAllTo(`${folderName}`);
    await rm(`${folderName}/archive.zip`, { recursive: true });
    // Parse XML file
    const dataBuffer = await readFile(`${folderName}/20230221_ED807_full.xml`);
    const cyrillicDecoded = iconv.decode(dataBuffer, 'win1251');
    console.log(cyrillicDecoded);
    // Delete folder
    await rm(`${folderName}`, { recursive: true });
  } catch (err) {
    return console.error(err);
  }
  return result;
}


const url = `https://www.cbr.ru/vfs/mcirabis/BIKNew/20230221ED01OSBR.zip`;
parseBik(url);


