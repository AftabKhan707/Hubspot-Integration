const {
  getTotalOrderCount,
  getTotalGmv,
  getTotalOrderOfAllOrderType,
  getRestaurantDetails,
} = require("./service");
const { updateHubspotProperties } = require("./hubspot");
const { googleSheetsToHubspot } = require("./google-sheet");
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
  console.log("execution started", Date.now());
  try {
    googleSheetsToHubspot().then(data => {
      console.log('done');
    })
    await setHubspotProperties();
    console.log("properties updated");
  } catch (e) {
    console.log("error on updating", e);
  }

  console.log("execution ended", Date.now());
  return response;
};

async function setHubspotProperties() {
  return new Promise((resolve, reject) => {
    console.log("function called");

    let keys = [
      "eeorders_3d_dn",
      "eeorders_3d_dl",
      "eeorders_3d_tk",
      "eeorders_3d_all",
      "eeorders_7d_dn",
      "eeorders_7d_dl",
      "eeorders_7d_all",
      "eeorders_15d_dn",
      "eeorders_15d_dl",
      "eeorders_15d_tk",
      "eeorders_15d_all",
      "eeorders_30d_dn",
      "eeorders_30d_dl",
      "eeorders_30d_tk",
      "eeorders_30d",
      "gmv_lifetime_db",
      "gmv_30d_db",
      "gmv_7d_db",
      "gmv_1d_db",
    ];

    let last_3_days_dinein = getTotalOrderCount(3, 0);
    let last_3_days_delivery = getTotalOrderCount(3, 1);
    let last_3_days_tk = getTotalOrderCount(3, 2);

    let last_7_days_dinein = getTotalOrderCount(7, 0);
    let last_7_days_delivery = getTotalOrderCount(7, 1);
    // let last_7_days_tk = getTotalOrderCount(7, 2);

    let last_15_days_dinein = getTotalOrderCount(15, 0);
    let last_15_days_delivery = getTotalOrderCount(15, 1);
    let last_15_days_tk = getTotalOrderCount(15, 2);

    let last_30_days_dinein = getTotalOrderCount(30, 0);
    let last_30_days_delivery = getTotalOrderCount(30, 1);
    let last_30_days_tk = getTotalOrderCount(30, 2);

    let last_3_days_all = getTotalOrderOfAllOrderType(3);
    let last_7_days_all = getTotalOrderOfAllOrderType(7);
    let last_15_days_all = getTotalOrderOfAllOrderType(15);
    let last_30_days_all = getTotalOrderOfAllOrderType(30);

    let total_gmv = getTotalGmv(30, true);
    let last_30_days_gmv = getTotalGmv(30, false);
    let last_7_days_gmv = getTotalGmv(7, false);
    let last_1_days_gmv = getTotalGmv(1, false);
    let res_details = getRestaurantDetails();

   

    Promise.all([
      last_3_days_dinein,
      last_3_days_delivery,
      last_3_days_tk,
      last_3_days_all,
      last_7_days_dinein,
      last_7_days_delivery,
      last_7_days_all,
      last_15_days_dinein,
      last_15_days_delivery,
      last_15_days_tk,
      last_15_days_all,
      last_30_days_dinein,
      last_30_days_delivery,
      last_30_days_tk,
      last_30_days_all,
      total_gmv,
      last_30_days_gmv,
      last_7_days_gmv,
      last_1_days_gmv,
      res_details,
    ]).then(async (result) => {
      let len = result.length;
      let data = {};
      // len -1 as restaurant details api will not get covered in loop
      for (let i = 0; i < len - 1; i++) {
        let res = result[i].results;

        let key = keys[i];
        let resLen = res.length;
        // console.log(key, res);

        for (let j = 0; j < resLen; j++) {
          if(res[j]["?Count"] == 1){
            res[j]["?Count"] = 0;
          }
          if (res[j].deal_id && data[res[j].deal_id]) {
            
            data[res[j].deal_id]["properties"][key] =
              res[j]["?Count"] || res[j]["?SUM"] || 0;
          } else if (res[j].deal_id) {
            data[res[j].deal_id] = {};
            data[res[j].deal_id].id = res[j].deal_id;
            data[res[j].deal_id].properties = {};
            data[res[j].deal_id]["properties"][key] =
              res[j]["?Count"] || res[j]["?SUM"] || 0;
          }
        }
      }
      let rest_details = result[len - 1].results;
      let res_len = rest_details.length;
      for (let i = 0; i < res_len; i++) {
        let restaurant = rest_details[i];
        if (restaurant.deal_id && data[restaurant.deal_id]) {
          data[restaurant.deal_id]["properties"]["eeid_db"] =
            restaurant["nameid"];
          data[restaurant.deal_id]["properties"]["dealname"] =
            restaurant["name"];
          data[restaurant.deal_id]["properties"]["grab_db"] = restaurant[
            "gf_integration"
          ]
            ? true
            : false;
          data[restaurant.deal_id]["properties"]["loyalty_db"] = restaurant[
            "loyalty_v2"
          ]
            ? true
            : false;
          data[restaurant.deal_id]["properties"]["foodpanda_db"] = restaurant[
            "fp_integration"
          ]
            ? true
            : false;
        }
      }

      // console.log("rest_details", rest_details);
      let objKeys = Object.keys(data);
      let l = objKeys.length;
      let dealObj = [];
      for (let k = 0; k < l; k++) {
        dealObj.push(data[objKeys[k]]);
      }
      
      // console.log("**********************");
      // console.log(dealObj);
      try {
        let len = dealObj.length;
        while (len > 0) {
          let startIndex = len - 100 > 0 ? len - 100 : 0;
          let data = dealObj.splice(startIndex, len);
          len = startIndex;
          await updateHubspotProperties(data);
          console.log('updated', startIndex);
        }
        // while (len > 0) {
        //   let startIndex = len - 10 >= 0 ? len - 10 : 0;
        //   let dataObj = dealObj.splice(startIndex, len);
        //   len = startIndex;
        //   await updateHubspotProperties(dataObj);
        // }
      } catch (e) {
        console.log("error on hubspot properties update", e);
      }

      resolve(true);
    });
  });
}



// setHubspotProperties().then(() => {
//   console.log("updated");
// });

// googleSheetsToHubspot().then(data => {
//   console.log('done');
// })


