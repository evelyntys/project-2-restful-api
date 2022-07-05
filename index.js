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
    let db = await MongoUtil.connect(MONGOURI, 'tattoo_API');

    // CREATE MAIN
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

        //to pass studio object by reference => check if objectid already exists in database by postal code & unit-number
        //if yes, then pass studio object by reference
        //if not, create new studio object

        let matchingStudio = await db.collection('studio_data').findOne({
            'address.unit': studio[0]['address']['unit'],
            'address.postal': parseInt(studio[0]['address']['postal'])
        })

        if (matchingStudio != null) {
            try {
                let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(matchingStudio._id)
                },
                    {
                        '$set': {
                            name: studio[0].name,
                            private: studio[0].private,
                            address: {
                                street: studio[0]['address']['street'],
                                unit: studio[0]['address']['unit'],
                                postal: parseInt(studio[0]['address']['postal'])
                            },
                            bookingsRequired: studio[0].bookingsRequired,
                            otherServices: studio[0].otherServices
                        }
                    })
                console.log(updated)

            } catch (e) {
                res.send('error')
                console.log(e);
            }
        }


        else {
            try {
                await db.collection('studio_data').insertOne({
                    name: studio[0].name,
                    private: studio[0].private,
                    address: {
                        street: studio[0]['address']['street'],
                        unit: studio[0]['address']['unit'],
                        postal: parseInt(studio[0]['address']['postal'])
                    },
                    bookingsRequired: studio[0].bookingsRequired,
                    otherServices: studio[0].otherServices
                })
            } catch (e) {
                res.send('error')
                console.log(e);
            }
        }

        let studioToInsert = await db.collection('studio_data').findOne({
            'address.unit': studio[0]['address']['unit'],
            'address.postal': parseInt(studio[0]['address']['postal'])

        })

        studio = studioToInsert;

        try {
            let result = await db.collection('tattoo_artists').insertOne({
                name: name,
                gender: gender,
                yearStarted: yearStarted,
                method: method,
                temporary: temporary,
                style: style,
                ink: ink,
                contact: contact,
                studio: [studio],
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

    // READ MAIN
    app.get('/show-artists', async function (req, res) {
        let criteria = {};

        // to change to req.BODY
        if (req.query.name) {
            criteria['name'] = {
                $regex: req.query.name,
                $options: "i"
            }
        }

        if (req.query.instagram) {
            criteria['contact'] = {
                $elemMatch: {
                    'instagram': {
                        $regex: req.query.instagram,
                        $options: "i"
                    }
                }
            }
        }

        let results = await db.collection('tattoo_artists').find(criteria, {
            projection: {
                name: 1, yearStarted: 1, gender: 1, style: 1, ink: 1
            }
        }).toArray();

        res.status(200);
        res.send(results)
    })


    // UPDATE MAIN
    app.put('/tattoo-artist/:id', async function (req, res) {
        let name = req.body.name;
        let gender = req.body.gender;
        let yearStarted = parseInt(req.body.yearStarted);
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let studio = req.body.studio;
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id),
        });
        let originalStudioID = artist.studio[0]['_id'];

        //update studio data
        //find the original studio document
        //update
        try{
            let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(originalStudioID)
                },
                    {
                        '$set': {
                            name: studio[0].name,
                            private: studio[0].private,
                            address: {
                                street: studio[0]['address']['street'],
                                unit: studio[0]['address']['unit'],
                                postal: parseInt(studio[0]['address']['postal'])
                            },
                            bookingsRequired: studio[0].bookingsRequired,
                            otherServices: studio[0].otherServices
                        }
                    })
                console.log(updated)

            } catch (e) {
                res.send('error')
                console.log(e);
            }

            studio = await db.collection('studio_data').findOne({
                _id: ObjectId(originalStudioID)
            })

        try {
            let result = await db.collection('tattoo_artists').updateOne({
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
                        studio: [studio],
                        ink: ink,
                        contact: contact,
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

    //DELETE MAIN
    app.delete('/tattoo-artist/:id', async function (req, res) {
        let results = await db.collection('tattoo_artists').deleteOne({
            _id: ObjectId(req.params.id)
        });
        res.status(200);
        res.send({
            message: 'entry successfully deleted'
        })
    })


    //CREATE REVIEW
    app.post('/tattoo-artist/:id/add-review', async function(req,res){
        let artistID = req.params.id
        let reviewer = req.body.reviewer;
        let rating = req.body.rating;
        let comment = req.body.comment;
        let response = await db.collection('tattoo_artists').updateOne({
            _id: ObjectId(artistID)
        }, {
            $push: {
                reviews: {
                    _id: new ObjectId(),
                    reviewer: reviewer,
                    rating: rating,
                    comment: comment
                }
            }
        })
        console.log(await db.collection('tattoo_artists').findOne({
            _id: artistID
        }))
        console.log(response)
        res.send('review successfully uploaded')
    })


}
main();

app.get('/', function (req, res) {
    res.send('test')
})


app.listen(8888, function () {
    console.log('server started')
})