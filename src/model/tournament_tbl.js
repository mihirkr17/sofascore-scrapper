const { model, Schema } = require("mongoose");

const tournamentSchema = new Schema({
   name: String,
   slug: String,
   id: Number,
   uniqueTournament: Schema.Types.Mixed,
   sportId: Number
});


const tournamentTbl = model("tournament_tbl", tournamentSchema, "tournament_tbl");

module.exports = { tournamentTbl };