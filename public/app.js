const state = {
day:0,
biologicalAge:40,
vitality:70,
repair:60,
inflammation:30,
damage:20
};

function escapeVelocity(){

const repairPower =
state.repair + state.vitality;

const decay =
state.damage + state.inflammation;

return repairPower - decay;

}

function render(){

document.getElementById("state").innerHTML = `
Day: ${state.day}<br>
Biological Age: ${state.biologicalAge.toFixed(2)}<br>
Vitality: ${state.vitality}<br>
Repair: ${state.repair}<br>
Inflammation: ${state.inflammation}<br>
Damage: ${state.damage}<br>
Escape Velocity: ${escapeVelocity()}
`;

}

function log(msg){

const el = document.getElementById("log");

el.innerHTML += `<div>${msg}</div>`;

}

function apply(type){

if(type==="sleep"){
state.repair+=4
state.inflammation-=2
log("Sleep improved repair")
}

if(type==="exercise"){
state.vitality+=5
state.inflammation-=1
log("Exercise increased vitality")
}

if(type==="nutrition"){
state.repair+=4
state.damage-=1
log("Nutrition helped repair")
}

if(type==="stress"){
state.inflammation+=6
state.vitality-=3
log("Stress increased inflammation")
}

if(type==="therapy"){
state.damage-=5
state.repair+=6
log("Repair therapy applied")
}

if(type==="age"){
state.day+=30
state.biologicalAge+=0.08
state.damage+=2
state.inflammation+=1
log("Time advanced")
}

render()

}

render()