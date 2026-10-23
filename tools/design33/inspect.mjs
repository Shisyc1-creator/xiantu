import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const root='D:/修仙文字游戏';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(root+'/《问道长生》设定总表.xlsx'));
console.log((await wb.inspect({kind:'region',sheetId:'地图设定',range:'A1:C8',maxChars:1800})).ndjson);
const img=await wb.render({sheetName:'地图设定',range:'A1:C10',scale:1,format:'png'});
await fs.writeFile(root+'/outputs/design33/before-map.png',new Uint8Array(await img.arrayBuffer()));
