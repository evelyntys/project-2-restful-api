const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const MONGOURI = process.env.MONGO_URI;

let app = express();

app.use(express.json());

app.use(cors());

async function main(){
    let db = await MongoUtil.connect(MONGOURI, 'tattoo-artists')
}

main();

app.get('/', function(req,res){
    res.send('hello')
})

app.listen(8888, function(){
    console.log('server started')
})