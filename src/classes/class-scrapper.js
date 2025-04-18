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


   async scrapeTeamLogo(items, sport, folder) {
      let browser;
      try {
         browser = await initBrowser(true, false, true);

         const page = await browser.newPage();
         const successIds = [];

         let index = 1;
         for (const item of items) {

            const idIs = parseInt(item);
            try {
               const apiUrl = `https://api.sofascore.app/api/v1/team/${idIs}/image`;

               console.log(`Going ${apiUrl}`);

               const viewSource = await page.goto(apiUrl);

               const buffer = await viewSource.buffer();

               if (buffer && Buffer.isBuffer(buffer) && buffer.length != 0) {
                  const folderPath = path.join(__dirname, `../../${folder}`);
                  // await fs.promises.mkdir(folderPath, { recursive: true });

                  const filePath = path.join(folderPath, `${idIs}.png`);
                  await fs.promises.writeFile(filePath, buffer);

                  console.log(`${index++} Image saved to ${filePath}`);
                  successIds.push(idIs);
               } else {
                  console.log(`⛔ ${index++} Image failed due to invalid type. iD: ${idIs}`);
               }

               await delay(2000);

            } catch (error) {
               console.log(error?.message);
               continue;
            }
         }

         return { successIds };

      } catch (error) {
         return { successIds: null };
      } finally {
         if (browser) await browser.close();
      }
   }


   async scrapeSofaScoreTeamDetails(teamLinks = []) {
      let browser = null;

      try {
         browser = await initBrowser(false, false, true);

         const page = await browser.newPage();


         // await page.goto("https://www.espn.in/mens-college-basketball/teams", pageLoadingOption());

         // await delay(2000)

         // const allTeamNames = await page.evaluate(() => {
         //    const l = [];
         //    const allH2 = document.querySelectorAll("section.TeamLinks a h2.di.clr-gray-01.h5");

         //    if (allH2) {
         //       allH2.forEach(h2 => {
         //          l.push(h2?.textContent?.trim());
         //       })
         //    }

         //    return l;
         // });

         // await delay(2000);


         // await page.goto("https://www.sofascore.com/american-football", pageLoadingOption());


         // let allLinksContainer = [];

         // console.log(`Got total ${allTeamNames.length} teams found for cbb`);

         // for (const name of allTeamNames) {
         //    await page.waitForSelector('input[id="search-input"]', selectorOption());

         //    await page.type('input[id="search-input"]', name);

         //    await delay(5000);

         //    const button = await page.evaluate(() => {
         //       const allBtn = document.querySelectorAll(".Box.Flex.DEqkV.dQOnin button");

         //       let str = "";
         //       if (allBtn) {
         //          allBtn.forEach(btn => {
         //             if (btn?.textContent?.trim() === "Team") {
         //                btn.click();
         //                str = "Team button clicked."
         //             }
         //          });

         //       } else {
         //          str = "No buttons found."
         //       }

         //       return str;
         //    });

         //    console.log(button);

         //    const getLinks = await page.evaluate(() => {
         //       const links = document.querySelectorAll("a.sc-44409fa7-0.eVLETE");

         //       const linkContainer = [];
         //       if (links) {
         //          links.forEach(link => {
         //             let linkText = link.getAttribute("href");

         //             if (typeof linkText === "string" && /team\/basketball/i.test(linkText.trim())) {
         //                linkContainer.push(`https://www.sofascore.com${linkText}`);
         //             }
         //          })
         //       }

         //       return linkContainer;
         //    });


         //    allLinksContainer.push(...getLinks);

         //    await delay(2000);

         //    await page.evaluate(() => {
         //       const input = document.querySelector('input[id="search-input"]');
         //       if (input) input.value = '';
         //   });
         // }


         // return allLinksContainer;









         // return;
         // const teamsData = [];

         // for (const link of teamLinks) {

         //    await page.goto(link, pageLoadingOption());

         //    let plainText = await page.evaluate(() => {
         //       return document.body.innerText.trim();
         //    });

         //    const regex = /"initialProps":\s*\{\s*"id":\s*(\d+),.*?"teamDetails":\s*\{\s*"name":\s*"([^"]+)",\s*"slug":\s*"([^"]+)",.*?"shortName":\s*"([^"]+)",.*?"gender":\s*"([^"]+)",.*?"nameCode":\s*"([^"]+)"/;

         //    const match = plainText.match(regex);

         //    if (match) {
         //       const id = match?.[1] || "";
         //       const teamName = match?.[2] || "";
         //       const slug = match?.[3] || "";
         //       const shortName = match?.[4] || "";
         //       const gender = match?.[5] || "";
         //       const nameCode = match?.[6] || "";

         //       teamsData.push({
         //          name: teamName,
         //          slug,
         //          short_name: shortName,
         //          gender,
         //          name_code: nameCode,
         //          id
         //       });
         //    }

         //    await delay(1000)
         // }

         // return teamsData;

         const sports = [
            {
               link: "https://www.sofascore.com/cricket",
               sportShort: "CRICK",
               mainSport: "cricket"
            },
            // {
            //    link: "https://www.sofascore.com/ice-hockey",
            //    sportShort: "NHL",
            //    mainSport: "Ice Hockey"
            // },
            // {
            //    link: "https://www.sofascore.com/ice-hockey",
            //    sportShort: "NHL",
            //    mainSport: "Ice Hockey"
            // },
            // {
            //    link: "https://www.sofascore.com/american-football",
            //    sportShort: "NFL",
            //    mainSport: "American Football"
            // },
            // {
            //    link: "https://www.sofascore.com/",
            //    sportShort: "FB",
            //    mainSport: "Football"
            // },
            // {
            //    link: "https://www.sofascore.com/basketball",
            //    sportShort: "NBA",
            //    mainSport: "Basketball"
            // },
            // {
            //    link: "https://www.sofascore.com/baseball",
            //    sportShort: "MLB",
            //    mainSport: "Baseball"
            // }
         ];

         const teams = [];

         for (const sport of sports) {
            await page.goto(sport?.link, pageLoadingOption());

            console.log(sport?.link);

            // const allCountry = await page.evaluate(() => {

            //    //Box Flex hjpzAT iWGVcA //".Box.klGMtt .Box.klGMtt .Box.cVcuZy a"
            //    const d = document.querySelectorAll(".Box.Flex.etwlSU.iWGVcA a");

            //    const links = [];
            //    if (d) {
            //       d.forEach(e => {
            //          const l = e?.getAttribute("href");

            //          links.push(`https://www.sofascore.com${l}`);
            //       })
            //    }

            //    return links;
            // });

            const allCountry = [
               'https://www.sofascore.com/cricket/afghanistan',
               'https://www.sofascore.com/cricket/asia',
               'https://www.sofascore.com/cricket/australia',
               'https://www.sofascore.com/cricket/bangladesh',
               'https://www.sofascore.com/cricket/canada',
               'https://www.sofascore.com/cricket/india',
               'https://www.sofascore.com/cricket/ireland',
               'https://www.sofascore.com/cricket/new-zealand',
               'https://www.sofascore.com/cricket/pakistan',
               'https://www.sofascore.com/cricket/south-africa',
               'https://www.sofascore.com/cricket/sri-lanka',
               'https://www.sofascore.com/cricket/united-kingdom',
               'https://www.sofascore.com/cricket/usa',
               'https://www.sofascore.com/cricket/west-indies',
               'https://www.sofascore.com/cricket/world',
               'https://www.sofascore.com/cricket/zimbabwe'
            ];
            const totalUrls = [];

            console.log(allCountry);

            console.log(`Total Country ${allCountry.length}`);

            if (allCountry && allCountry.length >= 1) {

               for (const country of allCountry) {
                  await page.goto(country, pageLoadingOption());

                  const allLeagues = await page.evaluate(() => {
                     const d = [];
                     const allLeagueLinks = document.querySelectorAll(".Box .mdDown\\:pt_sm .md\\:p_sm div a");

                     if (allLeagueLinks) {
                        allLeagueLinks.forEach((lLink) => {
                           const href = lLink.getAttribute("href");

                           d.push(
                              `view-source:https://www.sofascore.com${href}`
                           )
                        });
                     }

                     return d;
                  });

                  totalUrls.push(...allLeagues);
               }
            }

            console.log(`Found total ${totalUrls?.length} league urls.`);

            if (totalUrls && totalUrls.length >= 1) {

               for (const u of totalUrls) {
                  await page.goto(u, pageLoadingOption());

                  let plainText = await page.evaluate(() => {
                     // Get visible text, stripping out extra whitespace
                     return document.body.innerText.trim();
                  });

                  const regexForLeague = /"uniqueTournament":\{.*?"name":"(.*?)".*?"slug":"(.*?)".*?"category":\{.*?"name":"(.*?)".*?"slug":"(.*?)"/;
                  ///"uniqueTournament":\{.*?"name":"(.*?)".*?"category":\{.*?"name":"(.*?)"/;

                  const matchedLeague = regexForLeague.exec(plainText);

                  let league = { league_name: "", league_country: "", league_country_slug: "", league_slug: "" };

                  if (matchedLeague) {
                     league.league_name = matchedLeague?.[1];
                     league.league_slug = matchedLeague?.[2];
                     league.league_country = matchedLeague?.[3];
                     league.league_country_slug = matchedLeague?.[4];
                  }

                  const regex = /"team":\{.*?"name":"(.*?)".*?"slug":"(.*?)".*?"shortName":"(.*?)".*?"nameCode":"(.*?)".*?"type":(\d+).*?"id":(\d+)/g;

                  let match;

                  while ((match = regex.exec(plainText)) !== null) {
                     teams.push({
                        name: match[1],
                        slug: match[2],
                        short_name: match[3],
                        name_code: match[4],
                        id: match[6],
                        ...league
                     });
                  }

                  await delay(1000)
                  // console.log(teams);
               }

            }

            teams.push(...totalUrls)
         }

         console.log(`Got total ${teams?.length} teams.`);
         return teams;
      } catch (error) {
         console.warn(`An error occurred in scrape : ${error?.message}`);

         return [];
         // return [expertsProPicksContainer, expertsRecordsContainer];
      } finally {
         if (browser) await browser.close();
      }
   }

}


module.exports = new Scrapper();