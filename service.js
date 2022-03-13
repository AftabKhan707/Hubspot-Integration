const rockset = require("@rockset/client").default;
const apikey =
  "lqfg0TKiwEuGfBkv5wFomeSFMyldBsca4eESXcqgIwgoAYd6VIWLGsbJkbogFeav";
const rocksetClient = rockset(apikey);

module.exports = {
  getTotalOrderCount,
  getTotalGmv,
  getTotalOrderOfAllOrderType,
  getRestaurantDetails
};

function getTotalOrderCount(days, order_type) {
  let days_in_seconds = 86400 * Number(days);
  let ending_time = new Date().setHours(0, 0, 0) / 1000;
  let starting_time = ending_time - days_in_seconds;
//   console.log(starting_time);
//   console.log(ending_time);
  return rocksetClient.queryLambdas
    .executeQueryLambda("commons", "order_details", "ba9b326a9a70d22f", {
      parameters: [
        {
          name: "ending_time",
          type: "float",
          value: ending_time,
        },
        {
          name: "order_status",
          type: "int",
          value: 4,
        },
        {
          name: "order_type",
          type: "int",
          value: order_type,
        },
        {
          name: "starting_time",
          type: "float",
          value: starting_time,
        },
      ],
    })
}

function getTotalGmv(days, from_start = false) {
  let days_in_seconds = 86400 * Number(days);
  let ending_time = new Date().setHours(0, 0, 0) / 1000;
  let starting_time = ending_time - days_in_seconds;
  if(from_start){
    starting_time = 0;
  }
  return rocksetClient.queryLambdas
    .executeQueryLambda("commons", "gmv", "8fec86f2b465ac2a", {
      parameters: [
        {
          name: "ending_time",
          type: "float",
          value: ending_time,
        },
        {
          name: "starting_time",
          type: "float",
          value: starting_time,
        },
      ],
    })
}

function getTotalOrderOfAllOrderType(days) {
  let days_in_seconds = 86400 * Number(days);
  let ending_time = new Date().setHours(0, 0, 0) / 1000;
  let starting_time = ending_time - days_in_seconds;
  return rocksetClient.queryLambdas
    .executeQueryLambda(
      "commons",
      "total_order_all_order_type",
      "8a7093fc672679a2",
      {
        parameters: [
          {
            name: "ending_time",
            type: "float",
            value: ending_time,
          },
          {
            name: "order_status",
            type: "int",
            value: "4",
          },
          {
            name: "starting_time",
            type: "float",
            value: starting_time,
          },
        ],
      }
    )
}

function getRestaurantDetails(){
return rocksetClient.queryLambdas.executeQueryLambda("commons", "fetch_restaurant_details", "0c7baee0c1ee4d2b", null)
}
