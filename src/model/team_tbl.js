const { model, Schema } = require("mongoose");

const teamSchema = new Schema({
   name: { type: String, default: '' },
   slug: { type: String, default: '' },
   shortName: { type: String, default: '' },
   gender: { type: String, default: '' },
   sport: { type: Schema.Types.Mixed, default: {} },
   userCount: { type: Number, default: 0 },
   playerTeamInfo: { type: Schema.Types.Mixed, default: null },
   nameCode: { type: String, default: '' },
   ranking: { type: Number, default: 0 },
   class: { type: Number, default: 0 },
   disabled: { type: Boolean, default: false },
   national: { type: Boolean, default: false },
   type: { type: Number, default: 1 },
   id: { type: Number, unique: true, required: true },
   country: { type: Schema.Types.Mixed, default: {} },
   entityType: { type: String, default: 'team' },
   fullName: { type: String, default: '' },
   subTeams: { type: [Schema.Types.Mixed], default: [] },
   teamColors: { type: Schema.Types.Mixed, default: {} },
   fieldTranslations: { type: Schema.Types.Mixed, default: {} },
});

const tennisTeamTbl = model("tennis_team_tbl", teamSchema, "tennis_team_tbl");

const footballTeamTbl = model("football_team_tbl", teamSchema, "football_team_tbl");

module.exports = { tennisTeamTbl, footballTeamTbl };