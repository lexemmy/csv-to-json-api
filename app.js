
const express = require("express");
const bodyparser=require('body-parser');
const csvToJson = require('papaparse');
const randomstring = require('randomstring');
const https = require('https');

const app = express();
app.use(bodyparser.json());

//function to filter json based on specified fields
function filter(data, fields) {
  
  let result = Object.keys(data)
  .filter(key => fields.includes(key))
  .reduce((obj, key) => {
    obj[key] = data[key];
    return obj;
  }, {});
  return result;
}



app.post('/csvtojson', (req, res) => {
  
  let csv = req.body.csv.url;
	let select_fields = req.body.csv.select_fields;
  
  let random_identifier = randomstring.generate();
  
  let fileExtention = csv.split('.').pop().toLowerCase();   //get file extention

	if (fileExtention !== 'csv') {            //check valid csv file extention
		return res.status(200).json({
				status: 'error',
				message: 'only csv file allowed'
				});
	}
  
  
  https.get(csv, (response) => {
	let data = '';

	response.on('data', (chunk) =>{
		data += chunk;
	});

	response.on('end', () => {
	
    
     let json = csvToJson.parse(data, {header: true}).data;  //convert csv to json

	if (select_fields === undefined) {     //return all fields if select_fields parameter is not passed
		return res.status(200).json({
		"conversion_key": random_identifier,
		 "json": json
		});
	}
  
  let jsonArray = [];
  
  for(let i=0; i<json.length; i++){
    jsonArray.push(filter(json[i], select_fields))    //store objects with required fields to array
	}
  
  res.status(200).json({
		"conversion_key": random_identifier,
		"json": jsonArray
		});
		
	});
}).on("error", (err) => {
	console.log("Error: " + err.message);
});
  
 
  
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

