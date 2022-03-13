# Hubspot-Integration

Previously Product team need to manage Hubspot CRM manaually by running the queries on SQL data-base and then update the properties like Total GMV, 
Total charges from order billing, total order all order type etc.
Built AWS lambda functiion so that all the properties of CRM gets updated with the help of query lambdas.
Set an event on lambda function so that at every midnight all the properties gets updated.
