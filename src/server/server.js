const mf_computer = require("./mf_computer")
const mf_utils = require("./server_utils")

// Millenium Falcon infos. Loaded from millennium-falcon.json
var rebelsDataOK = false
var empireDataOK = false
var mapOK = false

// Bounty-hunters infos. Loaded from empire.json
var appData={}

const path = require('path')

// Require Express to run server and routes
const express = require('express')

//Parse incoming request bodies in a middleware before handlers
const bodyParser = require('body-parser')

// Cors for cross origin allowance
const cors = require('cors')

//provides request and get methods that behave identically to those found on the native http and https modules
const{http, https} = require('follow-redirects');

//File I/O is provided by simple wrappers 
const fs = require('fs');


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
const { json } = require('body-parser')
dotenv.config();


// Parsing rebels file
const rebelsFile = path.join(process.cwd(), process.env.FOLDER,"millennium-falcon.json")
console.log("Parsing rebels file = "+rebelsFile)

try{
    let rebelsData = server_utils.read_json_data(rebelsFile)
    console.log(rebelsData)
    rebelsDataOK = rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.routes_db && rebelsData.autonomy
    if(rebelsDataOK){
        appData.rebelsData = rebelsData
        console.log("Rebels data loaded, Millennium Falcon currently at "+rebelsData.departure+" has "+rebelsData.autonomy+" days left to reach "+rebelsData.arrival)
    
        // Parsing DB
        const universeDBFile = path.join(process.cwd(), process.env.FOLDER, rebelsData.routes_db)
        server_utils.log_debug("Loading routes from "+universeDBFile)
        retData = server_utils.build_map_from_db(universeDBFile,rebelsData.departure,rebelsData.arrival);
        
        if(retData){
            mapOK = true
            
            appData.universeMap = retData.universeMap
            appData.planets = retData.planets
        }

    }else{
        console.log("Incorrect fields in rebel file "+rebelsFile)
    }
}catch{
    console.log("Could not read rebels data from "+rebelsFile)
}


const port = process.env.PORT

app.listen(port, function () {
    console.log('App listening on port '+port+'!')
})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "..",'client/views/index.html'));
});

app.post('/loadEmpireData', async function (req, res) {
    var prevData = appData.empireData
    try{
        const newData =req.body
        if(newData.countdown && newData.bounty_hunters){
            for(let bh of newData.bounty_hunters){
                if(!(bh.planet && bh.day)){
                    throw new Error("Incorrect value for bounty hunter. Missing planet or day.") 
                }
            }
        }else{
            throw new Error("Missing mandatory field countdown or bounty_hunters")
        }
        appData.empireData = newData;
        res.send(newData)  
        console.log("New empire data received");
        
    }catch(error){   
        console.log("Error when loading empire data");        
        empireData = prevData;
        res.send({'error':""+error})
    }
})

app.get('/loadMap', async function (req, res) {
    try{
        var retData = {}
        retData.universeMap = appData.universeMap
        retData.departure   = appData.rebelsData.departure
        retData.arrival     = appData.rebelsData.arrival
        retData.autonomy    = appData.rebelsData.autonomy
        res.send(retData)  
        console.log("Universe map uploaded");
    }catch(error){   
        console.log("Error when loading universe map");  
        res.send({'error':""+error})
    }
})

app.get('/computeCaptureProba' , async function (req, res){

   try{
        optimum = mf_computer.compute_proba(appData.empireData,appData.rebelsData,appData.universeMap)
        res.send(JSON.stringify(optimum))
    }catch(error){
        console.log("Error when computing proba");  
        res.send({'error':""+error})
    }
})


