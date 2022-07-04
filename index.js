const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const MONGOURI = process.env.MONGO_URI;

let app = express();

app.use(express.json());

app.use(cors());

async function main() {
    let db = await MongoUtil.connect(MONGOURI, 'tattoo-api');

    // CREATE
    app.post('/add-new-artist', async function (req, res) {
        let name = req.body.name;
        let gender = req.body.gender;
        let yearStarted = req.body.yearStarted;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let studio = req.body.studio;
        studio[0]['_id'] = new ObjectId()

        try {
            let result = await db.collection('tattoo-artists').insertOne({
                name: name,
                gender: gender,
                yearStarted: yearStarted,
                method: method,
                temporary: temporary,
                style: style,
                ink: ink,
                contact: contact,
                studio: studio,
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                error: 'error adding data, please contact administrator'
            });
            console.log(e)
        }

    })

    // READ
    app.get('/show-artists', async function (req, res) {
        let criteria = {};
        let results = await db.collection('tattoo-artists').find(criteria).toArray();

        res.status(200);
        res.send(results)
    })

    // UPDATE
    app.put('/tattoo-artist/:id', async function (req, res) {
        let name = req.body.name;
        let gender = req.body.gender;
        let yearStarted = req.body.yearStarted;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let studio = req.body.studio;

        try {
            let result = await db.collection('tattoo-artists').updateOne({
                _id: ObjectId(req.params.id)
            },
                {
                    '$set': {
                        name: name,
                        gender: gender,
                        yearStarted: yearStarted,
                        method: method,
                        temporary: temporary,
                        style: style,
                        ink: ink,
                        contact: contact,
                        studio: studio,
                    }
                });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                error: 'error updating data, please contact administrator'
            });
            console.log(e)
        }
    })

    app.delete('/tattoo-artist/:id', async function(req,res){
        let results = await db.collection('tattoo-artists').remove({
            _id: ObjectId(req.params.id)
        });
        res.status(200);
        res.send({
            message: 'entry successfully deleted'
        })
    })
}

main();

app.get('/', function (req, res) {
    res.send('test')
})


app.listen(8888, function () {
    console.log('server started')
})