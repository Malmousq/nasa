const mongoose = require('mongoose');



const MONGO_URL = process.env.MONGO_URL;
mongoose.connection.once('open', ()=>{
    console.log('Mongo DB connection ready') });
mongoose.connection.on('error', (error)=>{
    console.log(error);
})

async function  mongoConnect(){
await mongoose.connect(MONGO_URL);
}

async function mongoDisconnet(){
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnet
}
