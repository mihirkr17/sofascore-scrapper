const { model, Schema } = require("mongoose");

const upcomingSchema = new Schema({
   awayId: Number,
   homeId: Number,
   tournamentId: Number,
   startTimestamp: Number,
   sportName: String,
   sportId: Number,
   eventId: Number,
   upcoming: Boolean,
   customId: String,
   createdAt: Number,
   updatedAt: Number,
   seasonYear: String
});


const tennisUpcomingTbl = model("tennis_upcoming_tbl", upcomingSchema, "tennis_upcoming_tbl");
const footballUpcomingTbl = model("football_upcoming_tbl", upcomingSchema, "football_upcoming_tbl");
module.exports = { tennisUpcomingTbl, footballUpcomingTbl };