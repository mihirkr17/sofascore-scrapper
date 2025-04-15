const { tennisEventDetailsTbl, footballEventDetailsTbl } = require("../model/event_details_tbl");
const { tennisTeamTbl, footballTeamTbl } = require("../model/team_tbl");
const { tournamentTbl } = require("../model/tournament_tbl");
const { tennisUpcomingTbl, footballUpcomingTbl } = require("../model/upcoming_tbl");

module.exports.DB_URL = process.env.DB_URL;

const TABLE_MAP = {
   tennis_upcoming_tbl: tennisUpcomingTbl,
   football_upcoming_tbl: footballUpcomingTbl,
   tennis_event_details_tbl: tennisEventDetailsTbl,
   football_event_details_tbl: footballEventDetailsTbl,
   tennis_team_tbl: tennisTeamTbl,
   football_team_tbl: footballTeamTbl,
   tournament_tbl: tournamentTbl
}


module.exports.ACCEPTABLE_SPORTS = ["NHL", "NBA", "FOOTBALL", "NFL", "MLB", "CFB", "CBB"];


module.exports.getTable = (tableName = "") => {

   if (!tableName || typeof tableName !== "string") {
      return null;
   }

   return TABLE_MAP[tableName] ? TABLE_MAP[tableName] : null;
}