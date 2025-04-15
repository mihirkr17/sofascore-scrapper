let puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const { getNextFiveDays, delay } = require("../utils/core");
const fs = require("fs");
const path = require("path");

const PROXY_USERNAME = 'mihir1704';
const PROXY_PASSWORD = 'm.CPG7k3ByVhdzr';
const PROXY_SERVER = 'open.proxymesh.com';
const PROXY_SERVER_PORT = '31280';

async function initBrowser(isHeadless = true, useProxy = false, useStealth = true) {
   const args = [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
   ]

   if (useProxy) {
      args.push(`--proxy-server=http://${PROXY_SERVER}:${PROXY_SERVER_PORT}`,)

      console.log(args);
   }

   if (useStealth) {
      puppeteer = puppeteer.use(Stealth());
   }

   return await puppeteer.launch({
      headless: isHeadless,
      args,
      executablePath:
         process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath()
   });
}

const selectorOption = (time = 32000, visible = true) => ({
   timeout: typeof time !== "number" ? 32000 : time,
   visible: typeof visible !== "boolean" ? true : visible
});

const pageLoadingOption = (waitUntil = "", time = 320000) => ({ waitUntil: waitUntil || "load", timeout: typeof time !== "number" ? 32000 : time });

class Scrapper {

   constructor() { };



   async scrapeSofaScoreUpcomingEvents(sport) {
      let browser;
      try {
         browser = await initBrowser(false, false, true);

         const page = await browser.newPage();

         let allData = [];

         const nextFiveDays = getNextFiveDays();

         for (const day of nextFiveDays) {

            try {

               const voteUrl = "https://www.sofascore.com/api/v1/event/13711173/votes";

               const apiUrl = `https://www.sofascore.com/api/v1/sport/${sport}/scheduled-events/${day}`;

               console.log(`Going ${apiUrl}`);

               const [response] = await Promise.all([
                  page.waitForResponse(response => response.url() === apiUrl && response.status() === 200),
                  page.goto(apiUrl, pageLoadingOption("load"))
               ]);

               const json = await response.json();

               if (json?.events) {
                  allData.push(...json?.events);
               }

               await delay(3000);

            } catch (error) {
               console.log(error?.message);
            }
         }

         return allData;

      } catch (error) {
         return [];
      } finally {
         if (browser) await browser.close();
      }
   }





   async scrapeSofaScoreEventDetails(data) {
      let browser;
      let allData = [];
      try {
         browser = await initBrowser(true, false, true);

         const page = await browser.newPage();

         for (const event of data) {

            try {

               const apiUrl = `https://www.sofascore.com/api/v1/event/${event?.eventId}`;

               console.log(`Going ${apiUrl}`);

               const [response] = await Promise.all([
                  page.waitForResponse(response => response.url() === apiUrl && response.status() === 200),
                  page.goto(apiUrl, pageLoadingOption("load"))
               ]);

               const json = await response.json();

               if (json?.event) {

                  const ev = json?.event;
                  allData.push(ev);
               }

               await delay(5000);

            } catch (error) {
               console.log(error?.message);
               continue;
            }
         }

         return allData;

      } catch (error) {
         return allData;
      } finally {
         if (browser) await browser.close();
      }
   }




   async scrapeTennisEventDetails() {
      let browser;
      let allData = [];
      try {
         browser = await initBrowser(false, false, true);

         const page = await browser.newPage();

         try {

            const apiUrl = `https://matchstat.com/predictions-tips/wp-json/sofa-sports/v1/get-tennis-stats/?p1_name=Borna%20Gojo&p2_name=Alexander%20Shevchenko&tn_type=atp&year=2025`;

            console.log(`Going ${apiUrl}`);

            const [response] = await Promise.all([
               page.waitForResponse(response => response.url() === apiUrl && response.status() === 200),
               page.goto(apiUrl, pageLoadingOption("load"))
            ]);

            const json = await response.json();

            if (json?.data) {
               allData = json?.data;
            }

            await delay(5000);

         } catch (error) {
            console.log(error?.message);
         }

         return allData;

      } catch (error) {
         return allData;
      } finally {
         if (browser) await browser.close();
      }
   }


   async scrapeTeamLogo(items, sport) {
      let browser;
      try {
         browser = await initBrowser(true, false, true);

         const page = await browser.newPage();

         const failedIds = [];
         const successIds = [];

         let index = 1;
         for (const item of items) {
            try {

               const apiUrl = `https://api.sofascore.app/api/v1/team/${item?.id}/image`;

               console.log(`Going ${apiUrl}`);

               const viewSource = await page.goto(apiUrl);

               const buffer = await viewSource.buffer();

               if (buffer) {
                  const folderPath = path.join(__dirname, "../../sofascore_images");
                  await fs.promises.mkdir(folderPath, { recursive: true });

                  const filePath = path.join(folderPath, `${sport}_${item?.id}.png`);
                  await fs.promises.writeFile(filePath, buffer);

                  console.log(`${index++} Image saved to ${filePath}`);
                  successIds.push(item?.id);
               } else {
                  failedIds.push(item?.id);
               }

               await delay(2000);

            } catch (error) {
               console.log(error?.message);
               failedIds.push(item?.id);
               continue;
            }
         }

         return { successIds, failedIds };

      } catch (error) {
         return { sofa_team_id: null, failedIds: null };
      } finally {
         if (browser) await browser.close();
      }
   }
}


module.exports = new Scrapper();