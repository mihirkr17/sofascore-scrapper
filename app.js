const { scrapeTennisEventDetails, scrapeTeamLogo } = require("./src/classes/class-scrapper");
const fs = require("fs");

function strToTime(isoString) {
   return new Date(isoString).getTime() / 1000;
}


function convertTimeStrToReadable(timeStr) {

   if (!timeStr) {
      return "";
   }

   if (timeStr.indexOf(":") == -1) {
      return timeStr;
   }

   const [hours, minutes] = timeStr.split(":");

   const h = parseInt(hours);
   const m = parseInt(minutes);

   const hStr = h > 0 ? `${h} hour${h > 1 ? "s" : ""}` : "";
   const mStr = m > 0 ? `${m} min` : "";

   return [hStr, mStr].filter(Boolean).join(" ");
}


function getOpponent(pastMatch, currentPlayer) {

   let opp = pastMatch?.player1?.name;

   if (pastMatch.player1.name == currentPlayer) {
      opp = pastMatch.player2.name;
   }

   return opp;
}



function carrierPerformancePredictionText(tnData, p1, p2) {

   const p1Profile = tnData?.p1_profile;
   const p2Profile = tnData?.p2_profile;
   const p1ProfileStats = tnData?.p1_profile_stat;
   const p2ProfileStats = tnData?.p2_profile_stat;

   const p1H2hVsBd = tnData?.p1_h2h_vs_bd;
   const p2H2hVsBd = tnData?.p2_h2h_vs_bd;

   return `<ul>
   <li>${p1} has a career high ranking of ${(p1Profile?.currentRank || 0)}, while ${p2} has a career high rank of ${(p2Profile?.currentRank || 0)}.</li>

   <li>
      ${p1} has claimed ${p1ProfileStats?.totalTitles || 0} Career titles and career earnings of $${(p1Profile?.careerMoney || 0).toLocaleString("en-IN")},
       versus ${p2ProfileStats?.totalTitles || 0} trophies for ${p2} and $${(p2Profile?.careerMoney || 0).toLocaleString("en-IN")} prize money.
      The last title for ${p1} was the 2024 Shanghai Rolex Masters, while ${p2} last won a trophy on.
   </li>

   <li>${p1} has a ${(p1H2hVsBd?.decidingSetWinPercentage || 0)}% deciding set win % (${(p1H2hVsBd?.decidingSetWin || 0)}/${(p1H2hVsBd?.decidingSetCount || 0)}),
    compared to ${(p2H2hVsBd?.decidingSetWinPercentage || 0)}% for ${p2} (${(p2H2hVsBd?.decidingSetWin || 0)}/${(p2H2hVsBd?.decidingSetCount || 0)})</li>

   <li>The 1st serve of ${p1} has resulted in him winning ${p1H2hVsBd?.firstServePercentage}% of points,
       and ${p2} has won ${(p2H2hVsBd?.firstServePercentage || 0)}% of his first serve points.</li>

   <li>Second serve points won, is ${(p1H2hVsBd?.winningOnSecondServePercentage || 0)}% for ${p1} and ${(p2H2hVsBd?.winningOnSecondServePercentage || 0)}% for ${p2}.</li>

   <li>After losing the first set, ${p1} manages to turn the match around and win it ${(p1H2hVsBd?.firstSetLoseMatchWinPercentage || 0)}% of the time,
    and ${p2} has a ${(p2H2hVsBd?.firstSetLoseMatchWinPercentage || 0)}% record in eventually winning the match.</li>

   </ul>`;
}

function getRecentFormPredictionText(tnData, p1Name, p2Name) {
   const p1RecentGames = tnData?.p1_profile_stat?.recentGames || [];
   const p2RecentGames = tnData?.p2_profile_stat?.recentGames || [];

   const p1RecentStats = tnData?.h2h_recent_stat_p1?.recentStats || null;
   const p2RecentStats = tnData?.h2h_recent_stat_p2?.recentStats || null;

   let p1PastMatches = tnData?.p1_past_matches?.singles || [];
   p1PastMatches = p1PastMatches.sort((a, b) => (strToTime(b.date) || 0) - (strToTime(a.date) || 0));
   let p1PastMatchDetail = p1PastMatches[0];
   const p1CurrentBreakDown = tnData?.p1_cur_bd || null;
   const p1CurrentStats = tnData?.p1_current_stat || null;
   let p2PastMatches = tnData?.p2_past_matches?.singles || [];
   p2PastMatches = p2PastMatches.sort((a, b) => (strToTime(b.date) || 0) - (strToTime(a.date) || 0));
   let p2PastMatchDetail = p2PastMatches[0];
   const p2CurrentBreakDown = tnData?.p2_cur_bd || null;
   const p2CurrentStats = tnData?.p2_current_stat || null;

   return `<ul>
   <li>${p1Name} has won ${(p1RecentGames.filter(e => e == "w") || []).length} of the last ${p1RecentGames.length || 0} matches he has played, 
   while ${p2Name} has secured ${(p2RecentGames.filter(e => e == "w") || []).length} victories over the same range.</li>

   <li>${p1Name} has been winning ${(p1RecentStats?.secondServeWinPer || 0)}% of his own second serve points, and ${(p1RecentStats?.oppSecondServeWinPer || 0)}% of his opponents,
    while ${p2Name} has won ${(p2RecentStats?.secondServeWinPer || 0)}% of his second serve points and ${(p2RecentStats?.oppSecondServeWinPer || 0)}% of his opponents.</li>

   <li>${p1Name} comes into this match having won a ${convertTimeStrToReadable(p1CurrentStats?.lastMatchTime || p1CurrentStats?.totalTime)} minute battle vs ${getOpponent(p1PastMatchDetail, p1CurrentStats?.name)}
             in which he managed to win ${p1CurrentBreakDown?.returnPtsWinPercentage}% of return 
            points (${p1CurrentBreakDown?.returnPtsWin}/${p1CurrentBreakDown?.returnPtsWinOf}), hitting ${p1CurrentBreakDown?.acesTotal || 0} aces himself during the match.
    </li>

   <li>${p2Name} comes into this match having won a ${convertTimeStrToReadable(p2CurrentStats?.lastMatchTime || p2CurrentStats?.totalTime)} minute battle vs ${getOpponent(p2PastMatchDetail, p2CurrentStats?.name)}
         in which he managed to win ${p2CurrentBreakDown?.returnPtsWinPercentage}% of return 
         points (${p2CurrentBreakDown?.returnPtsWin}/${p2CurrentBreakDown?.returnPtsWinOf}), hitting ${p2CurrentBreakDown?.acesTotal || 0} aces himself during the match.
      </li>

   <li>In this event so far ${p1Name} has been holding serve ${p1CurrentStats?.serviceHoldPercentage}% of the time (${p1CurrentStats?.serviceHold}/${p1CurrentStats?.serviceHoldOf}), 
   while ${p2Name} has held his serve ${p2CurrentStats?.serviceHoldPercentage}% of the time (${p2CurrentStats?.serviceHold}/${p2CurrentStats?.serviceHoldOf}.</li>

</ul>`;

}

async function main() {
   try {

      const d = await scrapeTeamLogo([
         {
            id: 2817,
            sport: "football"
         }
      ]);

      console.log(d);

      return;
      // const tnData = require("./tn_data.json");

      // const tnData = await scrapeTennisEventDetails();

      // await fs.promises.writeFile("tn_data.json", JSON.stringify(tnData));

      // console.log(tnData);

      const recentFormPrediction = getRecentFormPredictionText(tnData, "Borna Gojo", "Alexander Shevchenko");

      const carrierPerformancePrediction = carrierPerformancePredictionText(tnData, "Borna Gojo", "Alexander Shevchenko");


   } catch (error) {

   }
}

main();