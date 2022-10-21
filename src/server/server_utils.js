
var debug = false

//File I/O is provided by simple wrappers 
const fs = require('fs');
const path = require("path");

const build_map_from_db = (dbfile,departure,arrival) =>{
    
    let universeMap={}
    universeMap.nodes = []
    universeMap.edges = []

    let planets=[]

    let ret_data = {}
    

    //try{
        const db = require('better-sqlite3')(dbfile, { readonly: true,fileMustExist:true });
        const stmt = db.prepare(`SELECT ORIGIN as o, DESTINATION as d, TRAVEL_TIME as t FROM ROUTES`).all();

        log_debug("Statement : ",stmt)
        for(let row of stmt){
            var o = row.o
            var d = row.d
            var t = row.t

            sizeO = Math.random() * (30 - 5) + 5
            sizeD = Math.random() * (30 - 5) + 5
            // planet sizes : log_debug(sizeO,sizeD)
            universeMap.edges.push({ from: o, to: d ,width: 1, label:t});
            
            if(!planets.includes(o)){
                planets.push(o)
                if(o==departure){
                    universeMap.nodes.push({id:o, label:o, size:sizeO, color:{border:"green",background:"blue"}})
                }else if(o==arrival){
                    universeMap.nodes.push({id:o, label:o, size:sizeO, color:{border:"brown",background:"red"}})
                }else{
                    universeMap.nodes.push({id:planets.length, label:o, size:sizeO})
                }
            }
            
            if(!planets.includes(d)){
                planets.push(d)
                if(d==departure){
                    universeMap.nodes.push({id:d, label:d, size:sizeD, color:{border:"green",background:"blue"}})
                }else if(d==arrival){
                    universeMap.nodes.push({id:d, label:d, size:sizeD,color:{border:"brown",background:"red"}})
                }else{
                    universeMap.nodes.push({id:d, label:d,size:sizeD})
                }
            }   
        } 
        log_debug("universeMap loaded")
        ret_data.universeMap=universeMap
        ret_data.planets = planets
        return ret_data
    /*}catch{
        log_debug("Could not load universe map")
        return false
    }*/
}

const read_json_data =(fileName)=>{
    const fileContent = fs.readFileSync(fileName)
    let data = JSON.parse(fileContent)
    return data
}


const log_debug=(msg)=>{
    if(debug){
        console.log(msg)
    }
}
module.exports = {read_json_data,build_map_from_db,log_debug}
