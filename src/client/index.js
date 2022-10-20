import './sass/landing_page.scss'
import './javascript/stars.js'

const reader = new FileReader();
var empire_data=null
var debug = false

// HTML elements
const empireDisplay = document.getElementById('empire-data')
const button =  document.getElementById("compute-button")
const success = document.getElementById('success-proba')
const bestPath = document.getElementById('best-path')
const fileLoadedName = document.getElementById('empire-file-name')


// No probability computed if empire data not loaded
button.disabled = true


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
                    fileLoadedName.textContent = file.name +" loaded"
    
            }else{
                console.log("Error while loading empire data, check json format.")
            }
        }})(file);
       
    reader.readAsText(file)
           
};

const displayEmpireData = data=>{
    

    while (empireDisplay.firstChild) {
        empireDisplay.removeChild(empireDisplay.lastChild);
    }


    if(data && Object.keys(data).length>0){
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
    
        button.setAttribute("class","data-nores-button") 
        button.disabled=false
    }else{
        button.disabled=true     
        button.setAttribute("class","nodata-nores-button") 
    }
};


const check_empire_data=data=>{
    return (data.countdown && data.countdown>=0 && 
        data.bounty_hunters && Array.isArray(data.bounty_hunters))
}


const getTravelInfo = ()=>{
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
            graph_data = res.universeMap
            // create a network
            var container = document.getElementById("universe-graph");
            var data = {
                nodes: new vis.DataSet(graph_data.nodes),
                edges: new vis.DataSet(graph_data.edges)
            };
            var options = {
                layout:{
                    randomSeed :1
                },
                nodes: {
                    shape: "dot",
                    scaling: {
                        label: {
                            min: 8,
                            max: 20,
                        }
                    },
                    borderWidth: 4,
                    color: {
                        border: "rgb(22,22,22)",
                        background: "rgb(66,66,66)",
                    },
                    font: '20px trajan white',
                },
                edges: {
                    font: '16px trajan red',
                    color: "lightgray",
                    scaling: {
                        label: {
                            min: 30,
                            max: 50,
                        }
                    }
                }
            };
            var network = new vis.Network(container, data,options)
            if(debug){
                console.log('Universe map loaded: '+JSON.stringify(res));
            }
        }
      })      
}


const handleSubmit = ()=>{
    console.log("Button class = "+button.getAttribute("class"))
    if(button.getAttribute("class")=="data-nores-button"){
        console.log("Compute success probability")

        fetch('http://localhost:8089/computeCaptureProba', 
        {
            credentials: 'same-origin',
            method: 'GET'
        }).then(res => res.json())
        .then(res=> {
            if(res.error){
                console.log('[WARN] Could not compute optimal path: '+JSON.stringify(res.error))
              }else{
                if(res.successProba<0.5){   
                    success.setAttribute('class','success-red');
                }else if(res.successProba<0.75){
                    success.setAttribute('class','success-orange');
                }else{
                    success.setAttribute('class','success-green');
                }
                success.textContent = "Probability of success = "+ res.successProba+""
                bestPath.textContent ="Optimal path = "+ res.bestPath  
                button.textContent=("Reset empire data") 
                button.setAttribute("class","data-res-button") 
            }
        })    
    }else if(button.getAttribute("class")=="data-res-button"){
        button.textContent=("Compute capture probability") 
        button.setAttribute("class","nodata-nores-button") 
        displayEmpireData({})
        fileLoadedName.textContent = ""
        success.textContent =""
        bestPath.textContent =""

    }else{    
        console.log("Should not be here, button disabled")
    }

}
export{empireLoader, getTravelInfo,handleSubmit}
