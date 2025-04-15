

function extractYYYYMMDD(dateStr) {
   let cleanedDateStr = dateStr?.replace(/(\d+)(st|nd|rd|th)/, '$1');
   const dayMatch = cleanedDateStr?.match(/\b\d{1,2}\b/);
   const monthMatch = cleanedDateStr?.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi);
   const day = dayMatch ? dayMatch[0] : null;
   const month = monthMatch ? monthMatch[0] : null;
   const year = new Date().getUTCFullYear();

   if (day && month) {
      const monthIndex = new Date(`${month} 1`).getMonth();
      const utcTimestamp = Date.UTC(year, monthIndex, day);
      const utcDate = new Date(utcTimestamp);

      // Format the date to YYYY-MM-DD
      const formattedDate = utcDate.getUTCFullYear() + '-' +
         String(utcDate.getUTCMonth() + 1).padStart(2, '0') + '-' +  // Add 1 to month since it's 0-based
         String(utcDate.getUTCDate()).padStart(2, '0');

      return formattedDate;
   } else {
      return null;
   }
}


async function delay(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

function retry(func, maxRetry = 10) {
   return async (...args) => {

      let attemptsLeft = maxRetry;
      const isInfinite = maxRetry === "infinity";

      while (attemptsLeft > 0 || isInfinite) {
         try {
            return await func(...args);
         } catch (error) {
            console.log(`An error occurred: ${error?.message}. Retrying in 4s...`);

            if (!isInfinite) {
               attemptsLeft--;

               if (attemptsLeft === 0) {
                  console.log(`Retry limit reached. Last error: ${error.message}`);
                  // throw new Error(`Retry attempts exhausted. Last error: ${error.message}`);
                  return null;
               }
            }
            // await this.delay(4000);
            await delay(4000);
         }
      }
   }
}


// return "2024-12-12" yyyy-mm-dd
function getTodayDates() {
   const today = new Date();
   const day = String(today.getDate()).padStart(2, '0');
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const year = today.getFullYear();
   return `${year}-${month}-${day}`;
}


function getExactDates(timestamp) {
   const today = new Date(timestamp * 1000);
   const day = String(today.getDate()).padStart(2, '0');
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const year = today.getFullYear();
   return `${year}-${month}-${day}`;
}

const incrementor = [0.25, 0.50, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0];

const incrementor2 = [1, 2, 3, 4, 5];


function uniqueDataByIdentifier(items = []) {

   if (!Array.isArray(items) || items?.length <= 0) {
      return [];
   }

   const newMap = new Map();

   items.forEach(item => {

      if (item?.identifier !== undefined) {
         newMap.set(item.identifier, item);
      }
   });

   return Array.from(newMap.values());
}


function slugMaker(str) {

   let slug = str.toLowerCase();

   slug = slug.replace(/\s+/g, '-'); // Replacing spaces with hyphens

   // Remove any special characters but preserve specific scripts
   slug = slug.replace(/[^a-z0-9\-\u0900-\u097F\u0400-\u04FF\u0370-\u03FF\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]+/g, '');

   slug = slug.replace(/^-+|-+$/g, ''); // Trim any leading or trailing hyphens

   slug = slug.replace(/-{2,}/g, '-'); // Handling consecutive hyphens

   return slug;
}

function capitalizeFirstLetterOfEachWord(string) {
   if (!string) return string;
   return string.toLowerCase().replace(/-|\s+/g, " ")
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').trim();
}


function sanitizeStr(str) {
   if (!str || typeof str !== "string") return "";
   return str?.replace(/\n\s*/g, " ")?.replace(/\s{2,}/g, " ")?.trim();
}


function timeStampToDateString(paramTimeStamp) {

   if (isNaN(paramTimeStamp)) {
      return "";
   }

   const timestamp = Number(paramTimeStamp) * 1000;
   const date = new Date(timestamp);
   return date.toISOString().split('T')[0];
}




function convertToPlainEnglish(string) {
   // Normalize to decompose combined characters
   const normalizedString = string?.normalize('NFD')?.toLowerCase();

   // console.log(normalizedString);

   const characterMap = {
      'ß': 'ss', 'þ': 'th', 'æ': 'ae', 'œ': 'oe', 'ı': 'i', 'İ': 'I',
      'ø': 'o', 'Ø': 'O', 'Ł': 'L', 'ł': 'l', 'be?ikta?': 'besiktas',
      '?l?sk': 'slask', 'Wroc?aw': 'wroclaw', 'kas?mpa?a': 'kasimpasa',
      'ba?ak?ehir': 'basaksehir', 'plze?': 'plzen', 'qaraba?': 'Qarabag',
      'st': 'saint', "II": "b", 'III': 'c', 'I': 'a'
   };

   return normalizedString?.split('')
      .map(char => characterMap[char] || char)
      .join('')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}


const removeStopWords = (text) => {
   text = convertToPlainEnglish(text);
   const stopWords = new Set(["the", "is", "and", "a", "an", "of", "to", "in", "on", "fc"]);
   return text?.split(" ").filter(word => !stopWords.has(word)).join(" ");
};


let replacements = {
   w: "women",
   m: "men",
   k: "kids",
   st: 'saint'
};

const preprocess = (str) => {
   str = str?.toLowerCase()?.replace(/[-|_|\.]/g, " ")?.replace(/\s{2,}/g, " ")
      ?.replace(/\b([a-zA-Z])\b/g, (match, p1) => replacements[p1] || match);
   return removeStopWords(str);
};

const preprocess2 = (str) => {
   str = str?.toLowerCase()?.replace(/[-|_|\.]/g, " ")?.replace(/\s{2,}/g, " ");
   return new Set(removeStopWords(str)?.split(" "));
};


function levenshteinDistance(a, b) {
   if (a == "") {
      return b?.length || 0;
   }

   if (b == "") {
      return a?.length || 0;
   }

   a = preprocess(a);
   b = preprocess(b);

   let aLength = a.length;
   let bLength = b.length;

   if (aLength === 0) {
      return bLength;
   }

   if (bLength === 0) {
      return aLength;
   }

   const matrix = Array.from({ length: aLength + 1 }, (_, i) =>
      Array.from({ length: bLength + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
   );

   for (let i = 1; i <= aLength; i++) {
      for (let j = 1; j <= bLength; j++) {
         if (a[i - 1] === b[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
         } else {
            matrix[i][j] = Math.min(
               matrix[i - 1][j] + 1,
               matrix[i][j - 1] + 1,
               matrix[i - 1][j - 1] + 1
            );
         }
      }
   }

   return matrix[aLength][bLength];
}
function getSimilarity(str1, str2) {

   if (typeof str1 !== "string" || typeof str2 !== "string") {
      return 0;
   }
   const distance = levenshteinDistance(str1, str2);
   const maxLength = Math.max(str1.length, str2.length);
   return ((1 - distance / maxLength) * 100);
}

const getSimilarity2 = (str1, str2) => {
   const setA = preprocess2(str1);
   const setB = preprocess2(str2);

   const intersection = new Set([...setA].filter(x => setB.has(x)));

   const union = new Set([...setA, ...setB]);

   return (intersection.size / union.size) * 100;
}

const commonFootballSportAbbrRegex = /\b(SC|FC|AFC|AC|CF|KF|SK|SSC|CS|US|RC|CA|FK|IK|VV|BK|IF|CSD|TSV|AS)\b/gi;

// Flexible matching function
function matchTeams(firstStr, secondStr, threshold = 50, sport = "") {

   let similarity = 0;

   if (sport === "football") {
      firstStr = firstStr?.replace(commonFootballSportAbbrRegex, "");

      secondStr = secondStr?.replace(commonFootballSportAbbrRegex, "");
   }


   similarity = getSimilarity(firstStr, secondStr);

   const resultOfSimilarity = similarity >= threshold;
   return resultOfSimilarity;
}

function utcTimeGenerator(utcTimeStamp) {

   const date = new Date(utcTimeStamp);

   const exact_date = date.toISOString().split('T')[0];

   const options = { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' };

   let human_readable = date.toLocaleString('en-GB', options).replace(',', ' at');

   human_readable = human_readable?.replace(/\s(am|pm)$/i, (match) => match.toUpperCase());

   return {
      readableTime: human_readable,
      timeStamp: utcTimeStamp / 1000,
      exactDate: exact_date
   }
}




// Odds Converter: Converts between Decimal, Fractional, and American Odds

// Convert Decimal to Other Formats
function decimalToFraction(decimalOdds) {

   decimalOdds = parseFloat(decimalOdds);

   if (isNaN(decimalOdds)) {
      throw new Error("Decimal odds must be greater than 1 to calculate fractional odds.");
   }

   if (decimalOdds <= 1) {
      throw new Error("Decimal odds must be greater than 1 to calculate fractional odds.");
   }

   const fractionalValue = decimalOdds - 1;

   const precision = 1000;
   const numerator = Math.round(fractionalValue * precision);
   const denominator = precision;

   function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
   }

   const divisor = gcd(numerator, denominator);

   return `${numerator / divisor}/${denominator / divisor}`;
}

function decimalToAmerican(decimal) {
   if (decimal >= 2.0) {
      return `+${((decimal - 1) * 100).toFixed(0)}`;
   } else {
      return `${(-100 / (decimal - 1)).toFixed(0)}`;
   }
}

// Convert Fractional to Other Formats
function fractionalToDecimal(fraction) {
   const [numerator, denominator] = fraction.split("/").map(Number);
   return (numerator / denominator + 1).toFixed(2);
}

function fractionalToAmerican(fraction) {
   const decimal = fractionalToDecimal(fraction);
   return decimalToAmerican(decimal);
}

// Convert American to Other Formats
function americanToDecimal(american) {
   const value = Number(american);
   if (value > 0) {
      return ((value / 100) + 1).toFixed(2);
   } else {
      return ((100 / Math.abs(value)) + 1).toFixed(2);
   }
}

function americanToFraction(american) {
   const decimal = americanToDecimal(american);
   return decimalToFraction(decimal);
}

// Main Conversion Function
function convertOdds(input, type) {
   let result = {};

   switch (type) {
      case 'decimal':
         result.odds_frac = decimalToFraction(Number(input));
         result.odds_usa = decimalToAmerican(Number(input));
         result.odds_dec = `${Number(input).toFixed(2)}`;
         break;

      case 'fractional':
         result.odds_dec = fractionalToDecimal(input);
         result.odds_usa = fractionalToAmerican(input);
         result.odds_frac = input;
         break;

      case 'american':
         result.odds_dec = americanToDecimal(input);
         result.odds_frac = americanToFraction(input);
         result.odds_usa = input;
         break;

      default:
         return "";
   }

   return result;
}

function determineOddsType(odd) {
   if (/\d+\/\d+/.test(odd)) {
      return "fractional";
   } else if (/^[+-]\d+$/.test(odd)) {
      return "american";
   } else if (/^\d+\.?\d*$/.test(odd)) {
      return "decimal";
   } else {
      return "";
   }
}


function groupEventsBySport(events = []) {
   if (!Array.isArray(events)) {
      throw new TypeError("Expected an array of events");
   }

   return Object.values(
      events.reduce((acc, { _id, sport }) => {
         acc[sport] = acc[sport] || { sport, _ids: [] };
         acc[sport]._ids.push(_id);
         return acc;
      }, {})
   );
}



function sortSofaH2hByAsc(sofaData) {

   if (!sofaData?.sofa_home_id || !sofaData?.sofa_away_id || !sofaData?.sofa_home_slug || !sofaData?.sofa_away_slug) {
      return "";
   }

   const homeId = Number(sofaData?.sofa_home_id);
   const awayId = Number(sofaData?.sofa_away_id);
   const homeSlug = sofaData?.sofa_home_slug;
   const awaySlug = sofaData?.sofa_away_slug;

   let h2h_link;

   if (homeId > awayId) {
      h2h_link = `${awaySlug}/${homeSlug}/${awayId}/${homeId}/`;
   } else {
      h2h_link = `${homeSlug}/${awaySlug}/${homeId}/${awayId}/`;
   }

   return h2h_link;
}

function isValidOdds(odd) {
   const oddsRegex = /^(\+?\d+|\-\d+|\d+(\.\d+)?|\d+\/\d+)$/;
   return oddsRegex.test(odd);
}

function currentUtcTimeStamp() {
   return Math.floor(Date.now() / 1000);
}

function getNextFiveDays() {
   const dates = [];
   const today = new Date();

   for (let i = 0; i <= 3; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      // Format the date as "YYYY-MM-DD"
      const formattedDate = nextDate.toISOString().split('T')[0];
      dates.push(formattedDate);
   }

   return dates;
}

module.exports = {
   getNextFiveDays,
   currentUtcTimeStamp,
   isValidOdds,
   determineOddsType,
   groupEventsBySport,
   convertOdds,
   getTodayDates, retry, delay, extractYYYYMMDD,
   incrementor, incrementor2, uniqueDataByIdentifier,
   slugMaker, capitalizeFirstLetterOfEachWord, sanitizeStr,
   timeStampToDateString, matchTeams, utcTimeGenerator, sortSofaH2hByAsc, getExactDates
}