const {parse} = require('csv-parse');
const fs = require('fs');
const path = require('path');
const planets = require('./planets.mango');
let nb = 0;


function habitablePlanet(planet){
  return planet.koi_disposition === 'CONFIRMED' 
  && planet.koi_insol > 0.36 && planet.koi_insol < 1.1
  && planet.koi_prad < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve, reject) =>{
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
    .pipe(parse({
     comment : '#',
    columns : true
     }))
    .on('data', async (data)=>{
        if(habitablePlanet(data)){
            savePlanet(data);
        }
    })
    .on('error', (error)=>{
     console.log(error)
     reject(error);
    })
    .on('end', async ()=>{
     const countPlanetsFound = (await getAllPlanets()).length;
     console.log(`Planets found : ${countPlanetsFound}`)
        resolve();
        })
    })
}

async function getAllPlanets(){
    return await planets.find({},{
        '__v': 0,
        '_id': 0,
    });
}

async function savePlanet(planet){
    try{
        await planets.updateOne({
         keplerName : planet.kepler_name},
            {keplerName : planet.kepler_name},
            {upsert: true})
    }catch(err){
        console.error(`Planet could not be saved : ${err}` )
    }
}

module.exports ={
    getAllPlanets,
    loadPlanetsData
}