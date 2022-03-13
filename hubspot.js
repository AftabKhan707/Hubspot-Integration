const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ apiKey: 'f13b884f-b67a-4fd0-8d61-caec62aea1a6' });


module.exports = {
    updateHubspotProperties
}


function updateHubspotProperties(dealObjArray){

// const dealObj = {
//     id: '7461170737',
//     properties: {
//         amount: 1233334,
//         dealname: "Aftab test"
//     },
// }


 return hubspotClient.crm.deals.batchApi.update({ inputs: dealObjArray })
}


