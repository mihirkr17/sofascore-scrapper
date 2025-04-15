
require("dotenv").config();
const ALL_SPORTS = require("./sports");
const { getUpcomingEvents } = require("./src/classes/class-api");
const { scrapeSofaScoreUpcomingEvents, scrapeSofaScoreEventDetails } = require("./src/classes/class-scrapper");
const { getTable } = require("./src/configs/constant");
const connectToDB = require("./src/configs/db");
const { currentUtcTimeStamp, getExactDates } = require("./src/utils/core");



async function main() {
   try {
      const args = process.argv.slice(2);

      let arg = args.join("|");

      const regex = /event_details/gi;

      if (!regex.test(arg)) {
         throw new Error("Invalid arguments.");
      }
      const currentUtc = currentUtcTimeStamp();

      await connectToDB();

      for (const sport of ALL_SPORTS) {
         if (sport?.slug !== "tennis") {
            continue;
         }

         const upcomingData = await getUpcomingEvents(sport?.variable);

         console.log(`Got total ${upcomingData?.length || 0} upcoming events.`);

         const teamTable = getTable(`${sport?.variable}_team_tbl`);
         const eventDetailsTable = getTable(`${sport?.variable}_event_details_tbl`);
         const tournamentTbl = getTable("tournament_tbl");

         console.log(`Total ${upcomingData.length || 0} upcoming events founded for ${sport?.name}.`);

         const events = await scrapeSofaScoreEventDetails(upcomingData);

         const successIds = [];

         for (let i = 0; i < events.length; i += 15) {
            let chunks = events.slice(i, i + 15);

            await Promise.all(chunks.map(async (event) => {

               try {
                  const result = await eventDetailsTable.findOneAndUpdate(
                     { eventId: event?.id },
                     {
                        $set: {
                           eventId: event?.id,
                           homeId: event?.homeTeam?.id,
                           awayId: event?.awayTeam?.id,
                           homeScore: event?.homeScore,
                           awayScore: event?.awayScore,
                           winnerCode: event?.winnerCode,
                           venue: event?.venue,
                           season: event?.season,
                           roundInfo: event?.roundInfo,
                           status: event?.status,
                           customId: event?.customId,
                        }
                     },
                     { upsert: true, new: true }
                  );

                  await teamTable.findOneAndUpdate({
                     id: event?.homeTeam?.id
                  }, { $set: event?.homeTeam }, { upsert: true, new: true });


                  await teamTable.findOneAndUpdate({
                     id: event?.awayTeam?.id
                  }, { $set: event?.awayTeam }, { upsert: true, new: true });

                  await tournamentTbl.findOneAndUpdate({
                     "uniqueTournament.id": event?.tournament?.uniqueTournament?.id,
                     sportId: sport?.id
                  }, {
                     $set: {
                        name: event?.tournament?.name, slug: event?.tournament?.slug,
                        id: event?.tournament?.id,
                        uniqueTournament: event?.tournament?.uniqueTournament,
                        sport: sport?.slug
                     }
                  }, { upsert: true, new: true });

                  successIds.push(result?._id);
                  console.log(`${result?.eventId} success.`);
               } catch (error) {
                  console.log(error?.message);
               }
            }));
         }
      }


   } catch (error) {
      console.log(error?.message);
      process.exit(1);
   } finally {
      console.log("Operation success");
      process.exit(0);
   }
}

main();