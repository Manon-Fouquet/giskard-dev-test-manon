const mf_computer = require("./mf_computer")
// import the readline module for work with stdin, or stdout.
func_args = []
process.argv.forEach(function (val, index, array) {
    mf_computer.log_debug("Argument "+index + ': ' + val);
    func_args.push(val)
  });


//File I/O is provided by simple wrappers 
const fs = require('fs');
const path = require("path");
//empire data

rebels_file = func_args[2]
const rebelsContent = fs.readFileSync(rebels_file)
mf_computer.log_debug("Reading "+rebels_file+", file content = "+rebelsContent)
rebelsData = JSON.parse(rebelsContent)

empire_file = func_args[3]
const empireContent = fs.readFileSync(empire_file)
mf_computer.log_debug("Reading "+empire_file+", file content = "+empireContent)
empireData = JSON.parse(empireContent)



if (rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.routes_db && rebelsData.autonomy){
    mf_computer.log_debug("Rebels data loaded, Millennium Falcon currently at "+rebelsData.departure+" has "+rebelsData.autonomy+" days left to reach "+rebelsData.arrival)
    const pathStrSplit = func_args[2].split("/")
    pathStrSplit.pop()
    mf_computer.log_debug(func_args[2])
    const universeDBFile = path.join(process.cwd(),  ...pathStrSplit,rebelsData.routes_db)
    
    
    mf_computer.log_debug("Loading routes from "+universeDBFile)
    dbData = build_map_from_db(universeDBFile)

    
}
console.log(mf_computer.compute_proba(empireData,rebelsData,universeMap).successProba)