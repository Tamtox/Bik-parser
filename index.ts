import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { rm, readFile } from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import * as iconv from 'iconv-lite';
import { parseString } from 'xml2js';
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
    const xmlString = iconv.decode(dataBuffer, 'win1251');
    const parseResult: any = await new Promise((resolve, reject) => {
      parseString(xmlString, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    // Aggregate data
    const participants = parseResult['ED807']['BICDirectoryEntry'];
    participants.forEach((participant: any) => {
      const bic = participant['$']['BIC'];
      const name = participant['ParticipantInfo'][0]['$']['NameP'];
      const accounts = participant['Accounts'];
      if (accounts && bic && name) {
        accounts.forEach((account: any) => {
          const corrAccount = account['$']['Account'];
          const entry: IAccountInfo = { bic, name, corrAccount };
          result.push(entry);
        });
      }
    });
    // Delete folder
    await rm(`${folderName}`, { recursive: true });
  } catch (err) {
    return console.error(err);
  }
  return result;
}

(async function () {
  const result = await parseBik(`https://www.cbr.ru/vfs/mcirabis/BIKNew/20230221ED01OSBR.zip`);
  console.dir(result);
})();



