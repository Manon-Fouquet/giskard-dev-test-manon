import './sass/landing_page.scss'
import './javascript/stars.js'

const reader = new FileReader();
var empire_data=null

const empireLoader = (event)=>{
    // Get file, read it as json, send it to the server, display it
    
    var file = event.target.files[0]
           
};

const displayEmpireData = data=>{
    const empireDisplay = document.getElementById('empire-data')
    while (empireDisplay.firstChild) {
        empireDisplay.removeChild(empireDisplay.lastChild);
    }

    console.log("Loading empire data")
};


const check_empire_data=data=>{
    return (data.countdown && data.countdown>=0 && 
        data.bounty_hunters && Array.isArray(data.bounty_hunters))
}


const build_graph = ()=>{
    //https://github.com/visjs/vis-network
    console.log("Building map")
}


export{empireLoader, build_graph}
