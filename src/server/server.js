// Millenium Falcon infos. Loaded from millennium-falcon.json
var rebelsData = {
    "autonomy": 6,
    "departure": "Tatooine",
    "arrival": "Endor",
    "routes_db": "universe.db"
  }

// Bounty-hunters infos. Loaded from empire.json
var empireData = {
    "countdown": 6, 
    "bounty_hunters": [
        {"planet": "Tatooine", "day": 4 },
        {"planet": "Dagobah", "day": 5 }
        ]
    }

const port = 8089

const path = require('path')


// Require Express to run server and routes
const express = require('express')

// To be able to fetch external API from server side
// NOT NEEDEDD IN THIS PROJECT
//const fetch = require('node-fetch');

//Parse incoming request bodies in a middleware before handlers
var bodyParser = require('body-parser')

// Cors for cross origin allowance
var cors = require('cors')

//provides request and get methods that behave identically to those found on the native http and https modules
const{http, https} = require('follow-redirects');

//File I/O is provided by simple wrappers 
// NOT NEEDED HERE
//var fs = require('fs');

// Start up an instance of app
const app = express()
app.use(cors())


/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize the main project folder                          
app.use(express.static('dist'))


// Load environment variables, especially API keys
const dotenv = require('dotenv');
dotenv.config();

app.listen(port, function () {
    console.log('Example app listening on port '+port+'!')
})


app.post('/loadEmpireData', async function (req, res) {
    var prevData = empireData
    try{
        const newData =req.body
        if(empireData.countdown && empireData.bounty_hunters){
            for(let bh of empireData.bounty_hunters){
                if(!(bh.planet && bh.day)){
                    throw new Error("Incorrect value for bounty hunter. Missing planet or day.") 
                }
            }
        }else{
            throw new Error("Missing mandatory field countdown or bounty_hunters")
        }
        empireData = newData;
        res.send(newData)  
        console.log("New empire data received");
    }catch(error){   
        console.log("Error when loading empire data");        
        empireData = Object.assign({}, prevData);
        res.send({'error':""+error})
    }
})


app.get('/computeCaptureProba' , async function (req, res){
    return 42.42
})