const axios = require('axios');

const launchesDb = require('./launches.mango');
const planets = require('./planets.mango');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = `https://api.spacexdata.com/v4/launches/query`;


async function populateLaunches(){
    const response =  await axios.post(SPACEX_API_URL, {
        query: {},
        options:{
            pagination: false,
            populate: [{
                    path : 'rocket',
                    select: {name : 1,}
                },
                {
                    path : 'payloads',
                    select: {'customers' : 1,}
                }
            ],
        },
    })

    if(response.status !==200){
        console.log('Problems on downloading');
        throw new Error('Download launch data failed');
    }
    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {

        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap(payload => { return  payload["customers"]})
        const launch ={
        flightNumber: launchDoc['flight_number'],
        mission: launchDoc['name'], //name
        rocket: launchDoc['flight_number']['name'], //rocket.name
        launchDate : launchDoc['date_local'], //date_local
        upcoming : launchDoc['upcoming'], //date_local,//upcoming
        success: launchDoc['success'], //success
        customers,
        }

        console.log(`${launch.flightNumber} : ${launch.mission}`);
        await saveLaunch(launch)
    }

}

async function loadLaunchesData(){

    const firstLaunch = await findLaunch({
        flightNumber : 1,
        rocket : 'Falcon 1',
        mission : 'FalconSat'
    })

    if(firstLaunch){
        console.log("Data already loaded");
    }else{
        await populateLaunches()
    }
}


async function findLaunch(filter){
    return await launchesDb.findOne(filter);
}


async function existLaunchWithId(launchId){
    return await findLaunch({flightNumber : launchId})
}

async function getLatestFlightNumber(){
    const latestLauch = await launchesDb.findOne().sort('-flightNumber');
    if(!latestLauch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLauch.flightNumber;

}

async function getAllLaunches(skip, limit){

    return await launchesDb.find({}, {'_id' : 0, '__v': 0})
                .sort({flightNumber : 1}) //1 = ASC;-1 = DESC
                .skip(skip)
                .limit(limit)
}

async function schudleNewLaunch(launch){
    
    const planet = await planets.findOne({
        keplerName : launch.target
        });

        if(!planet){
            throw new Error(`Planet doesn't exist`);
        }
    const newFlightNumber = await  getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch,{
              flightNumber : newFlightNumber,
               customers: ['ZTM', 'NASA'],
                upcoming: true,
                success: true,
            })
    await saveLaunch(newLaunch);

}


async function abortLaunchById(launchId){

    const abortedFlight = await launchesDb.updateOne({
        flightNumber:launchId
    },
    {
        upcoming: false,
        success: false,
    })

    return abortedFlight.modifiedCount === 1;
}

async function saveLaunch(launch){
    try {
        
        await launchesDb.findOneAndUpdate({
        flightNumber : launch.flightNumber,
            }, launch,{upsert: true});
    
    } catch (error) {
        console.log(error)
   } 
}




module.exports ={ 
                loadLaunchesData,
                existLaunchWithId,
                getAllLaunches,
                schudleNewLaunch,
                abortLaunchById,
                };