const server_utils  = require("./server_utils")
const path          = require("path");
const mf_computer   = require("./mf_computer")

// import the readline module for work with stdin, or stdout.
func_args = []
process.argv.forEach(function (val, index, array) {
    server_utils.log_debug("Argument "+index + ': ' + val);
    func_args.push(val)
  });


//empire data

const rebels_file = func_args[2]
server_utils.log_debug("Reading rebels file from"+rebels_file)
const rebelsData = server_utils.read_json_data(rebels_file)

const empire_file = func_args[3]
server_utils.log_debug("Reading empire file from"+empire_file)
const empireData = server_utils.read_json_data(empire_file)

const rebelsDataOK = rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.routes_db && rebelsData.autonomy
let dbData

if (rebelsDataOK){
    server_utils.log_debug("Rebels data loaded, Millennium Falcon currently at "+rebelsData.departure+" has "+rebelsData.autonomy+" days left to reach "+rebelsData.arrival)
    const pathStrSplit = func_args[2].split("/")
    pathStrSplit.pop()
    server_utils.log_debug(func_args[2])
    const universeDBFile = path.join(process.cwd(),  ...pathStrSplit,rebelsData.routes_db)
    server_utils.log_debug("Loading routes from "+universeDBFile)
    dbData = server_utils.build_map_from_db(universeDBFile,rebelsData.departure,rebelsData.arrival)   
    if(dbData){  
        let proba_success = mf_computer.compute_proba(empireData,rebelsData,dbData.universeMap)
        console.log(proba_success.successProba)
    }else{
        console.log("Could not load map from database")
    }
}else{
    console.log("Invalid rebels data")
}
