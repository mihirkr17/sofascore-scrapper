const fs = require("fs");
const { scrapeTeamLogo } = require("./src/classes/class-scrapper");
const path = require("path");

const successJson = "football_success";
const sportVar = "football";
const Teams = require("./football_teams.json");
const folder = "football";

async function main() {
   try {
      const successJsonData = require(`./${successJson}.json`);

      let finalData = Teams.map(e => parseInt(e?.id));

      console.log(`Before Filter ${finalData.length}`);

      finalData = [...new Set(finalData.filter(Boolean))];

      finalData = finalData.filter(e => !successJsonData.includes(e));

      finalData = finalData.sort((a, b) => (parseInt(a?.id) - parseInt(b?.id)));

      console.log(`After Filter ${finalData.length}`);

      if (finalData.length === 0) {
         process.exit(0);
      }

      const data = await scrapeTeamLogo(finalData.slice(0, 1000), sportVar, folder);

      if (Array.isArray(data?.successIds)) {
         console.log(`Total success ids are ${data?.successIds?.length}`);
         const sfi = Array.from(new Set([...successJsonData, ...data?.successIds]));
         await fs.promises.writeFile(`${successJson}.json`, JSON.stringify(sfi));
      }


   } catch (error) {
      console.log(error?.message);
   }
}
main();


// const folder = path.join(__dirname, 'football');

// fs.readdir(folder, (err, files) => {
//    console.log(files.length);
//   if (err) return console.error('Error reading folder:', err);

//   files.forEach((file, index) => {
//    if (file.startsWith('football_')) {
//       const newFileName = file.replace('football_', ''); // remove prefix
//       const oldPath = path.join(folder, file);
//       const newPath = path.join(folder, newFileName);

//       fs.rename(oldPath, newPath, (err) => {
//         if (err) {
//           console.error(`❌ Failed to rename ${file}:`, err);
//         } else {
//           console.log(`✅ ${file} → ${newFileName}`);
//         }
//       });
//     }
//   });
// });


// return;