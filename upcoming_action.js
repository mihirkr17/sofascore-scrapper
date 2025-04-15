
require("dotenv").config();
const ALL_SPORTS = require("./sports");
const { scrapeSofaScoreUpcomingEvents } = require("./src/classes/class-scrapper");
const { getTable } = require("./src/configs/constant");
const connectToDB = require("./src/configs/db");
const { currentUtcTimeStamp, getExactDates } = require("./src/utils/core");



async function main() {
   try {
      const args = process.argv.slice(2);

      let arg = args.join("|");

      const regex = /upcoming/gi;

      if (!regex.test(arg)) {
         throw new Error("Invalid arguments.");
      }
      const currentUtc = currentUtcTimeStamp();

      await connectToDB();

      for (sport of ALL_SPORTS) {

         if (sport?.slug !== "tennis") {
            continue;
         }
         const targetTime = "2025-04-14";

         const data = await scrapeSofaScoreUpcomingEvents(sport?.slug);

         const events = (data || []).filter(event => getExactDates(event?.startTimestamp) >= targetTime);

         console.log(`Total ${events.length || 0} upcoming events founded.`);

         const table = getTable(`${sport?.variable}_upcoming_tbl`);

         const successIds = [];

         for (let i = 0; i < events.length; i += 20) {
            let chunks = events.slice(i, i + 20);

            await Promise.all(chunks.map(async (event) => {
               let eventDetails = {
                  homeId: event?.homeTeam?.id,
                  awayId: event?.awayTeam?.id,
                  tournamentId: event?.tournament?.uniqueTournament?.id,
                  customId: event?.customId,
                  startTimestamp: event?.startTimestamp,
                  sportName: sport?.name,
                  sportId: sport?.id,
                  eventId: event?.id,
                  updatedAt: currentUtc,
                  upcoming: true,
                  seasonYear: event?.season?.year
               }

               try {
                  const result = await table.findOneAndUpdate(
                     { eventId: eventDetails?.eventId },
                     {
                        $set: eventDetails,
                        $setOnInsert: {
                           createdAt: currentUtc
                        }
                     },
                     {
                        upsert: true,
                        new: true
                     }
                  );

                  successIds.push(result?._id);
                  console.log(`${result?.eventId} success.`);
               } catch (error) {
                  console.log(error?.message);
               }


            }));
         }

         await table.updateMany(
            { _id: { $nin: successIds } },
            { $set: { upcoming: false } }
         );
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