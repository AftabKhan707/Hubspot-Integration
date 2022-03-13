const { google } = require("googleapis");
const { updateHubspotProperties } = require("./hubspot");

// Create a document object using the ID of the spreadsheet - obtained from its URL.
//var doc = new GoogleSpreadsheet('1cvNb5phFoSSx7raltDIqXsoIPLSgkC0qSlFuAmEGsYQ');
module.exports = {
  googleSheetsToHubspot,
};
googleSheetsToHubspot();
async function googleSheetsToHubspot() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "pure-feat-341509-0b04e8f21507.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "158UzZdPg9fyC9l0brrrMdY2esAR6UszDqW-Ywl4SvUQ";

  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });
  // console.log(metaData)

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Master Sheet For Hubspot Mapping",
  });
   console.log(getRows.data.values[0])
  await formatGoogleSheetData(getRows.data.values);
}

const hashMap = {
  onboardingdate_db: 2,
  dinein_active_status_db: 5,
  overall_active_status_db: 6,
  n30d_dine_in_qr__db: 8,
  n1d_dine_in_qr__db: 9,
  percentage_dinein_db: 10,
  percentage_takeaway_db: 11,
  percentage_delivery_db: 12,
};

async function formatGoogleSheetData(dataArray) {
  console.log("hello");
  const len = dataArray.length;
  let dealObjArray = [];
  let keys_all = Object.keys(hashMap);
  let keys = dataArray[0];
  let keys_all_length = keys_all.length;
  if (keys[4] !== "deal_id") return false;
  for (let i = 1; i < len; i++) {
    let temp_obj = {};
    if (!dataArray[i][4]) continue;
    temp_obj["id"] = dataArray[i][4];
    temp_obj["properties"] = {};
    for (let j = 0; j < keys_all_length; j++) {
      if (keys_all[j] === "onboardingdate_db") {
        temp_obj["properties"][keys_all[j]] = new Date(
          dataArray[i][hashMap[keys_all[j]]]
        ).setUTCHours(0, 0, 0, 0);
        continue;
      }
      temp_obj["properties"][keys_all[j]] = dataArray[i][hashMap[keys_all[j]]];
    }
    dealObjArray.push(temp_obj);
  }
  console.log("hello");
  console.log("temp", dealObjArray[1]);

  try {
      let len = dealObjArray.length;
      while (len > 0) {
        let startIndex = len - 100 > 0 ? len - 100 : 0;
        let data = dealObjArray.splice(startIndex, len);
        len = startIndex;
        await updateHubspotProperties(data);
        console.log('updated test', startIndex);
      }
    } catch (e) {
      console.log("error on hubspot properties update", e);
    }
  return true;
}

// googleSheetsToHubspot()
