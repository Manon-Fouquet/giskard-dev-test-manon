import './sass/landing_page.scss'
import './javascript/stars.js'

const reader = new FileReader();
var empire_data=null

/* STUB GRAPH DATA
    graph_data.nodes = [
        { id: 1, label: "Tatooine",color: {
            border: "green",
            background: "blue",
          } },
        { id: 2, label: "Dagobah" },
        { id: 3, label: "Endor" }
      ];

      // create an array with edges
      graph_data.edges = [
        { from: 1, to: 2 ,width: 1, title: "4"},
        { from: 2, to: 3 ,width: 1, title: "1"}
      ];
*/


const empireLoader = (event)=>{
    // Get file, read it as json, send it to the server, display it
    
    var file = event.target.files[0]
    
    reader.onload = (function(file) {
        return function(event){
            var loaded_data = this.result;
            empire_data = JSON.parse(loaded_data);
            if(check_empire_data(empire_data)){
                fetch('http://localhost:8089/loadEmpireData', 
                    {
                        credentials: 'same-origin',
                        method: 'POST',
                        headers: 
                        {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(empire_data)
                    })
                    .then(res => res.json())
                    .then(res=> 
                    {
                        if(res.error){
                            console.log('Could not load empire data: '+JSON.stringify(res.error));
                        }else{
                            console.log('Received new empire data: '+JSON.stringify(res));
                            displayEmpireData(res) ;
                        return res;
                        }
                        
                    }); 
                    document.getElementById('empire-file-name').textContent = file.name +" loaded"
    
            }else{
                console.log("Error while loading empire data, check json format.")
            }
        }})(file);
       
    reader.readAsText(file)
           
};

const displayEmpireData = data=>{
    const empireDisplay = document.getElementById('empire-data')
    while (empireDisplay.firstChild) {
        empireDisplay.removeChild(empireDisplay.lastChild);
    }

    console.log("Loading empire data")
    const empireCountDown = document.createElement('div');
    empireCountDown.setAttribute('class','empire-val');
    empireCountDown.id = "empire-countdown"
    empireCountDown.setAttribute('style', 'white-space: pre;');
    empireCountDown.textContent = ""+data.countdown+" days left before anihiliation"+"\n"
    empireDisplay.appendChild(empireCountDown);

    data.bounty_hunters.forEach(bountyHunter => {
        const nDays=bountyHunter.day
        empireCountDown.textContent +='\n'+"Bounty-Hunter on "+ bountyHunter.planet+" in "+nDays+" days";
        console.log(empireCountDown.textContent)
    });
};


const check_empire_data=data=>{
    return (data.countdown && data.countdown>=0 && 
        data.bounty_hunters && Array.isArray(data.bounty_hunters))
}


const build_graph = ()=>{
    //https://github.com/visjs/vis-network
    console.log("Building map")
    var graph_data = {}

    fetch('http://localhost:8089/loadMap', 
    {
        credentials: 'same-origin',
        method: 'GET',
        headers: 
        {
        'Content-Type': 'application/json',
        }
    })
      .then(res => res.json())
      .then(res=> 
      {
        if(res.error){
          console.log('Could not load universe map '+JSON.stringify(res.error));
        }else{
            graph_data = res
            // create a network
            var container = document.getElementById("universe-graph");
            var data = {
                nodes: new vis.DataSet(graph_data.nodes),
                edges: new vis.DataSet(graph_data.edges)
            };
            var options = {
                nodes: {
                    shape: "dot",
                    scaling: {
                    label: {
                        min: 8,
                        max: 20,
                    }
                    },
                    borderWidth: 4,
                    size: 20,
                    color: {
                        border: "#222222",
                        background: "#666666",
                    },
                    font: { color: "#eeeeee" }
                },
                edges: {
                color: "lightgray",
                }
            };
            var network = new vis.Network(container, data, options);
            console.log('Universe map loaded: '+JSON.stringify(res));
        }
      })      
}


export{empireLoader, build_graph}
