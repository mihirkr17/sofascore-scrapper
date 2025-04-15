const { model, Schema } = require("mongoose");

const eventDetailsSchema = new Schema({
   eventId: Number,
   homeId: Number,
   awayId: Number,
   homeScore: Schema.Types.Mixed,
   awayScore: Schema.Types.Mixed,
   winnerCode: Schema.Types.Mixed,
   venue: Schema.Types.Mixed,
   season: Schema.Types.Mixed,
   roundInfo: Schema.Types.Mixed,
   status: Schema.Types.Mixed,
   customId: String
});

const tennisEventDetailsTbl = model("tennis_event_details_tbl", eventDetailsSchema, "tennis_event_details_tbl");
const footballEventDetailsTbl = model("football_event_details_tbl", eventDetailsSchema, "football_event_details_tbl");


module.exports = { tennisEventDetailsTbl, footballEventDetailsTbl };