const C3PO = require("./C3PO")
// import the readline module for work with stdin, or stdout.
func_args = []
process.argv.forEach(function (val, index, array) {
    C3PO.log_debug("Argument "+index + ': ' + val);
    func_args.push(val)
  });


//File I/O is provided by simple wrappers 
const fs = require('fs');
const path = require("path");
//empire data

rebels_file = func_args[2]
const rebelsContent = fs.readFileSync(rebels_file)
C3PO.log_debug("Reading "+rebels_file+", file content = "+rebelsContent)
rebelsData = JSON.parse(rebelsContent)

empire_file = func_args[3]
const empireContent = fs.readFileSync(empire_file)
C3PO.log_debug("Reading "+empire_file+", file content = "+empireContent)
empireData = JSON.parse(empireContent)

var universeMap={}
universeMap.nodes = []
universeMap.edges = []

var planets=[]

var ret_data = {}

if (rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.routes_db && rebelsData.autonomy){
    C3PO.log_debug("Rebels data loaded, Millennium Falcon currently at "+rebelsData.departure+" has "+rebelsData.autonomy+" days left to reach "+rebelsData.arrival)
    const pathStrSplit = func_args[2].split("/")
    pathStrSplit.pop()
    C3PO.log_debug(func_args[2])
    const universeDBFile = path.join(process.cwd(),  ...pathStrSplit,rebelsData.routes_db)
    C3PO.log_debug("Loading routes from "+universeDBFile)
    
    const db = require('better-sqlite3')(universeDBFile, { readonly: true,fileMustExist:true });
    const stmt = db.prepare(`SELECT ORIGIN as o, DESTINATION as d, TRAVEL_TIME as t FROM ROUTES`).all();

    C3PO.log_debug("Statement : ",stmt)
    for(let row of stmt){
        var o = row.o
        var d = row.d
        var t = row.t

        sizeO = Math.random() * (30 - 5) + 5
        sizeD = Math.random() * (30 - 5) + 5
        // planet sizes : C3PO.log_debug(sizeO,sizeD)
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
    } 
    C3PO.log_debug("universeMap loaded")
}
console.log(C3PO.compute_proba(empireData,rebelsData,universeMap).successProba)