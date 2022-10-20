
//https://stackoverflow.com/questions/7538519/how-to-get-subarray-from-array
Array.prototype.subarray = function(start, end) {
    if (!end) { end = -1; } 
    return this.slice(start, this.length + 1 - (end * -1));
};

const get_travel_time=(visited_planets)=>{
    let d=0
    if (visited_planets.length==0){
        return d
    }

    let previous = visited_planets[0]
    
    for (const p of visited_planets.subarray(1,-1)){     
        d+=routes[previous][p]
        previous = p
    }
    return d
}

const get_path_as_string = (visited_planets) =>{
    if  (visited_planets.length==0){
        return ""
    }
    let ret_str = visited_planets[0]
    let previous = ret_str
    for (const p of visited_planets.subarray(1,-1)){
        ret_str+="--"+routes[previous][p]+"--"+p
        previous = p   
    }
    return ret_str
}

// Compute the number of encounters along a path and deduces success probability
const eval_proba = (path,empire_data,captureProba =0.1) =>{
    let cum_d = 0
    let n_meetings=0
    try{
        for (const [i, planet] of path.subarray(1,-1).entries()) {
            cum_d+=routes[path[i]][planet]
            if(cum_d in empire_data && empire_data[cum_d]==planet ){
                n_meetings+=1
            }
          }
          return Math.pow(1.0-captureProba,n_meetings)
    }catch{
        console.log("[ERROR] could not compute proba from array",path)
    }
    
     
    }


/*
###################
#   PATH FINDER   #
###################    
*/

const find_routes = (graph,end,countdown,current_path,current_autonomy,route_list,tank_capa=6) =>{

    let current_planet = current_path[current_path.length-1]
    if  (countdown==0){
        if  (current_planet==end){
            route_list.push([])
            route_list[route_list.length-1].push(...current_path) 
        }
        return []
    }
    
    for (const next_planet in graph[current_planet]){
        let d_to_next = graph[current_planet][next_planet]

        if  (d_to_next>countdown){
            // Not a valid path, planet destroyed
            continue
        }else if(d_to_next===undefined){
            console.log("ERROR")
        }

        let autonomy
        if  (next_planet==current_planet || current_autonomy<d_to_next){
            //need to refuel, or refuel anyway if staying overnight
            autonomy=tank_capa
        }else{
            autonomy-=d_to_next
        }
        current_path=current_path.concat(find_routes(graph,end,countdown-d_to_next,current_path.concat(next_planet),autonomy,route_list,tank_capa))
    }
        
    return []
}


/*
###################
#   UNIT TESTS    #
###################    
*/

const perform_unit_tests = ()=>{

    // TEST DATA
    const planets = {"Tatooine":0, "Dagobah":1,"Endor":2,"Hoth":3}

    const routes = {  "Tatooine":{"Tatooine":1,"Dagobah":6,"Hoth":6},
                "Dagobah":{"Dagobah":1,"Tatooine":6,"Hoth":1},
                "Hoth":{"Hoth":1,"Dagobah":1,"Endor":1,"Tatooine":6},
                "Endor":{"Endor":1,"Hoth":1}
                }

    const meetings = {6:"Hoth",7:"Hoth",8:"Hoth"}

    let path_to_endor = ['Tatooine', 'Hoth', 'Endor', 'Hoth', 'Hoth', 'Endor']


    console.log("######## UNIT TESTS ############")
    console.log(get_path_as_string(path_to_endor),"\n\t travel time = ",get_travel_time(path_to_endor),", success proba = " ,eval_proba(path_to_endor,meetings))

    console.log("Concatenate empty array:",path_to_endor.concat([]))

    console.log(routes)

    let route_list = []
    let countdown = 10
    let tank_capa = 6
    find_routes(routes,"Endor",countdown,["Tatooine"],countdown,route_list,tank_capa)

    console.log("Routes from Tatooine to Endor in less than ",countdown)
    console.log(route_list)
    if(route_list.length>0){
        max_proba = 0
        min_proba = 1
        best_route = null
        worst_route = null
        for (const r of route_list){
            p = eval_proba(r,meetings)
            if  (p>max_proba || best_route===null ){
                max_proba=p
                best_route = r
                }
            
            if (p<min_proba || worst_route===null ){
                min_proba = p
                worst_route =r
            }
        }
        
        console.log(route_list.length," routes found.")
        console.log("Best route is ",get_path_as_string(best_route), " with proba of success = ",max_proba)
        console.log("Worst route is ",get_path_as_string(worst_route), " with proba of success = ",min_proba)

    }else{
        console.log("No route found")
    } 


}