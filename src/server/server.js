// Millenium Falcon infos. Loaded from millennium-falcon.json
var rebelsData = null

// Bounty-hunters infos. Loaded from empire.json
var empireData = {
    "countdown": 6, 
    "bounty_hunters": [
        {"planet": "Tatooine", "day": 4 },
        {"planet": "Dagobah", "day": 5 }
        ]
    }
var universeMap={}
universeMap.nodes = []
universeMap.edges = []

var planets=[]

const port = 8089

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


const sqlite3 = require('sqlite3')
// Load environment variables, especially API keys
const dotenv = require('dotenv');
const { json } = require('body-parser')
dotenv.config();

const rebelsFile = path.join(process.cwd(), process.env.FOLDER,"millennium-falcon.json")
console.log("Rebels file = "+rebelsFile)

fs.readFile(rebelsFile, function (err, data) {
    if (err) {
      throw err;
    }
    rebelsData = JSON.parse(data)
    if (rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.routes_db && rebelsData.autonomy){
        console.log("Rebels data loaded, Millennium Falcon currently at "+rebelsData.departure+" has "+rebelsData.autonomy+" days left to reach "+rebelsData.arrival)
        
        const universeDBFile = path.join(process.cwd(), process.env.FOLDER, rebelsData.routes_db)
        console.log("Loading routes from "+universeDBFile)
        let db = new sqlite3.Database(universeDBFile, (err) => {
            if (err) {
                console.error(err.message);
            }
                console.log('Connexion to route mapper...OK!');

            });
        
        db.serialize(() => {
            
            db.each(`SELECT ORIGIN as o, DESTINATION as d, TRAVEL_TIME as t
                    FROM ROUTES`, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            var o = row.o
            var d = row.d
            var t = row.t

            sizeO = Math.random() * (30 - 5) + 5
            sizeD = Math.random() * (30 - 5) + 5
            console.log(sizeO)
            console.log(sizeD)
            universeMap.edges.push({ from: o, to: d ,width: 1, label:t});
            
            if(!planets.includes(o)){
                planets.push(o)
                if(o==rebelsData.departure){
                    universeMap.nodes.push({id:o, label:o, size:sizeO, color:{border:"green",background:"blue"}})
                }else if(o==rebelsData.arrival){
                    universeMap.nodes.push({id:o, label:o, size:sizeO, color:{border:"brown",background:"red"}})
                }else{
                    universeMap.nodes.push({id:planets.length, label:o, size:sizeO})
                }
            }
            
            if(!planets.includes(d)){
                planets.push(d)
                if(d==rebelsData.departure){
                    universeMap.nodes.push({id:d, label:d, size:sizeD, color:{border:"green",background:"blue"}})
                }else if(d==rebelsData.arrival){
                    universeMap.nodes.push({id:d, label:d, size:sizeD,color:{border:"brown",background:"red"}})
                }else{
                    universeMap.nodes.push({id:d, label:d,size:sizeD})
                }
            }
            console.log("Distance "+o + " - " + d+" \t= "+t);
            })
        }
        );
    }else{
        console.log("Failed loading Millennium Falcon data.")
    }
});


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

app.get('/loadMap', async function (req, res) {
    try{
        var retData = {}
        retData.universeMap = universeMap
        retData.departure   = rebelsData.departure
        retData.arrival     = rebelsData.arrival
        retData.autonomy    = rebelsData.autonomy
        res.send(retData)  
        console.log("Universe map uploaded");
    }catch(error){   
        console.log("Error when loading universe map");  
        res.send({'error':""+error})
    }
})


const buildPaths=()=>{
    /* 
    generate all paths reaching destination before (<=) countdown
    ASSUMPTIONS:
        - one may stay on the same planet (path i-->i with duration = 1)
          e.g. a path reaching dest at day 3 while countdown = 5 ends with
                ... - dest - dest - dest
        - it is possible to refuel even if autonomy>0
        - the initial autonomy = fuel tank capacity

     STRATEGY:
        - DFS of candidate paths with origin = departure, dest = destination and
          duration = countdown
        - no storage of visited nodes during DFS as it is possible to be N times 
          at a planet before countdown. Stop criterion: travel_duration = countdown
        - if staying overnight on a planet, refuel
         */

}

app.get('/computeCaptureProba' , async function (req, res){
    // TODO REMOVE STUB
    try{
        res.send({"bestPath":"A--1--B--2--C","successProba":0.42})
    }catch{
        console.log("Error when computing proba");  
        res.send({'error':""+error})
    }
})

