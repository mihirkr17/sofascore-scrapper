const { getTable } = require("../configs/constant");
const { currentUtcTimeStamp } = require("../utils/core");


class Api {
   constructor() {

   }


   async getUpcomingEvents(sport = "") {
      try {

         const table = getTable(`${sport}_upcoming_tbl`);

         const timeStamp = currentUtcTimeStamp();
         if (!table) {
            throw new Error("Table not found");
         }

         return table.find({
            upcoming: true,
            startTimestamp: { $gte: timeStamp }
         }).lean();

      } catch (error) {
         throw error;
      }
   }
}


module.exports = new Api();