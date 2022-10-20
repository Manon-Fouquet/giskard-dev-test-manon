
//https://stackoverflow.com/questions/7538519/how-to-get-subarray-from-array
Array.prototype.subarray = function(start, end) {
    if (!end) { end = -1; } 
    return this.slice(start, this.length + 1 - (end * -1));
};

const build_graph=(nodes,edges)=>{
    /*let universe_graph = nodes.map(obj=>{
        let rObj = {};
        let planet = obj.id;
        rObj[planet]={}
        rObj[planet][planet]=1;
        return rObj;
    })*/

    let universe_graph = Object.assign({}, ...nodes.map((x) => ({[x.id]: {}})));
   
    for (let [n, l] of Object.entries(universe_graph)) {
        l[n]=1
    }

    for(const e of edges){
        d = e.label
        from = e.from
        to = e.to
        universe_graph[from][to]=d
        universe_graph[to][from]=d
    }

    return universe_graph
}

const get_travel_time=(graph,visited_planets)=>{
    let d=0
    if (visited_planets.length==0){
        return d
    }

    let previous = visited_planets[0]
    
    for (const p of visited_planets.subarray(1,-1)){     
        d+=graph[previous][p]
        previous = p
    }
    return d
}

const get_path_as_string = (graph,visited_planets) =>{
    if  (visited_planets.length==0){
        return ""
    }
    let ret_str = visited_planets[0]
    let previous = ret_str
    for (const p of visited_planets.subarray(1,-1)){
        ret_str+="--"+graph[previous][p]+"--"+p
        previous = p   
    }
    return ret_str
}

// Compute the number of encounters along a path and deduces success probability
const eval_proba = (graph,path,empire_data,captureProba =0.1) =>{
    let cum_d = 0
    let n_meetings=0
    try{
        for (const [i, planet] of path.subarray(1,-1).entries()) {
            cum_d+=graph[path[Number.parseFloat(i)]][planet]
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

const get_best_path =(graph,route_list,meetings)=>{
    if(route_list.length>0){
        max_proba = 0
        min_proba = 1
        best_route = null
        worst_route = null
        for (const r of route_list){
            p = eval_proba(graph,r,meetings)
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
        console.log("Best route is ",get_path_as_string(graph,best_route), " with proba of success = ",max_proba)
        console.log("Worst route is ",get_path_as_string(graph,worst_route), " with proba of success = ",min_proba)
        return {"bestPath":get_path_as_string(graph,best_route),"successProba":max_proba}
    }
}

const check_data_ok=(empireData,rebelsData)=>{
    if(empireData.countdown && empireData.bounty_hunters){
        for(let bh of empireData.bounty_hunters){
            if(!(bh.planet && bh.day)){
                
                console.log("issue with bounty hunter ",bh)
                return false
            }
        }
    }else{
        
        console.log("issue with empire data ",empireData)
        return false
    }
    let check_rebels = (rebelsData && rebelsData.departure && rebelsData.arrival && rebelsData.autonomy)
    if(!check_rebels){
        console.log(rebelsData)
    }
    return check_rebels
}

/*
###################
#   UNIT TESTS    #
###################    
*/

const perform_unit_tests = ()=>{

    

    // TEST DATA
        let universe_graph=
    {
        nodes: [
            {
            id: 'Tatooine',
            label: 'Tatooine',
            size: 12.132820422211811,
            color: [Object]
            },
            { id: 'Dagobah', label: 'Dagobah', size: 21.787867429613286 },
            {
            id: 'Endor',
            label: 'Endor',
            size: 19.682031681295364,
            color: [Object]
            },
            { id: 'Hoth', label: 'Hoth', size: 8.079931759150561 }
        ],
        edges: [
            { from: 'Tatooine', to: 'Dagobah', width: 1, label: 6 },
            { from: 'Dagobah', to: 'Endor', width: 1, label: 4 },
            { from: 'Dagobah', to: 'Hoth', width: 1, label: 1 },
            { from: 'Hoth', to: 'Endor', width: 1, label: 1 },
            { from: 'Tatooine', to: 'Hoth', width: 1, label: 6 }
        ]
        }
    

    const graph =build_graph(universe_graph.nodes,universe_graph.edges)
    /* {  "Tatooine":{"Tatooine":1,"Dagobah":6,"Hoth":6},
                "Dagobah":{"Dagobah":1,"Tatooine":6,"Hoth":1},
                "Hoth":{"Hoth":1,"Dagobah":1,"Endor":1,"Tatooine":6},
                "Endor":{"Endor":1,"Hoth":1}
                }
                */

    const meetings = {6:"Hoth",7:"Hoth",8:"Hoth"}

    let path_to_endor = ['Tatooine', 'Hoth', 'Endor', 'Hoth', 'Hoth', 'Endor']


    console.log("######## UNIT TESTS ############")
    console.log(get_path_as_string(graph,path_to_endor),"\n\t travel time = ",get_travel_time(graph,path_to_endor),", success proba = " ,eval_proba(graph,path_to_endor,meetings))

    console.log("Concatenate empty array:",path_to_endor.concat([]))

    console.log(graph)

    let route_list = []
    let countdown = 10
    let tank_capa = 6
    find_routes(graph,"Endor",countdown,["Tatooine"],countdown,route_list,tank_capa)

    console.log("Routes from Tatooine to Endor in less than ",countdown)
    console.log(route_list)
    if(route_list.length>0){
        max_proba = 0
        min_proba = 1
        best_route = null
        worst_route = null
        for (const r of route_list){
            p = eval_proba(graph,r,meetings)
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
        console.log("Best route is ",get_path_as_string(graph,best_route), " with proba of success = ",max_proba)
        console.log("Worst route is ",get_path_as_string(graph,worst_route), " with proba of success = ",min_proba)

    }else{
        console.log("No route found")
    } 
}
//perform_unit_tests()

module.exports = {check_data_ok,build_graph,find_routes,get_best_path}
