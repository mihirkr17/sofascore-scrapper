const footballTeams = require("./football_teams.json");
const fs = require("fs");
const { scrapeTeamLogo } = require("./src/classes/class-scrapper");
const successFootballIds = require("./success_fb_ids.json");
const failedFootballIds = require("./failed_fb_ids.json");

async function main() {
   try {

      let finalData = footballTeams;

      console.log(`Before Filter ${finalData.length}`);

      finalData = finalData.filter(e => !successFootballIds.includes(parseInt(e?.id)));

      console.log(`After Filter ${finalData.length}`);

      const data = await scrapeTeamLogo(finalData, "football");

      if (Array.isArray(data?.successIds)) {
         const sfi = Array.from(new Set([...successFootballIds, ...data?.successIds]));
         await fs.promises.writeFile("success_fb_ids.json", JSON.stringify(sfi));
      }

      if (Array.isArray(data?.failedIds)) {
         const sfi = Array.from(new Set([...failedFootballIds, ...data?.failedIds]));
         await fs.promises.writeFile("failed_fb_ids.json", JSON.stringify(sfi));
      }


   } catch (error) {
      console.log(error?.message);
   }
}
main();