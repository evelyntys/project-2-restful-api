const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const MONGOURI = process.env.MONGO_URI;

let app = express();

app.use(express.json());

app.use(cors());

function returnArray(field) {
    let result = [];
    if (Array.isArray(field)) {
        result = field
    }
    else if (!Array.isArray(field)) {
        result = [field]
    }
    return result
}

async function main() {
    let db = await MongoUtil.connect(MONGOURI, 'tattoo_API');
    let currentYear = 2022;

    // CREATE MAIN
    app.post('/add-new-artist', async function (req, res) {
        let name = req.body.name;
        let gender = req.body.gender;
        let yearStarted = parseInt(req.body.yearStarted);
        let apprentice = req.body.apprentice;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let images = req.body.images;
        let studio = req.body.studio;
        let owner = req.body.owner;

        //to pass studio object by reference => check if objectid already exists in database by postal code & unit-number
        //if yes, then pass studio object by reference
        //if not, create new studio object

        let matchingStudio = await db.collection('studio_data').findOne({
            'address.unit': studio['address']['unit'],
            'address.postal': parseInt(studio['address']['postal'])
        })

        let validateStudio = "";

        if (!studio.name) {
            validateStudio += "please enter your studio name \n"
        }

        if (!studio.address.street) {
            validateStudio += "please enter the street name \n"
        }

        if (!studio.address.unit) {
            validateStudio += "please enter the unit \n"
        }

        if (!studio.address.postal || studio.address.postal.length != 6 || parseInt(studio.address.postal == NaN)) {
            validateStudio += "please enter a valid postal code\n"
        }

        if (!studio.otherServices) {
            validateStudio += "please enter nil if no other services \n"
        }

        if (matchingStudio != null) {
            if (validateStudio == "") {
                let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(matchingStudio._id)
                },
                    {
                        '$set': {
                            name: studio.name,
                            private: studio.private,
                            address: {
                                street: studio['address']['street'],
                                unit: studio['address']['unit'],
                                postal: parseInt(studio['address']['postal'])
                            },
                            bookingsRequired: studio.bookingsRequired,
                            otherServices: returnArray(studio.otherServices)
                        }
                    })
            } else {
                res.status(400);
                res.send(validateStudio)
            }
        }


        else {
            if (validateStudio == "") {
                let insertSuccess = await db.collection('studio_data').insertOne({
                    name: studio.name,
                    private: studio.private,
                    address: {
                        street: studio['address']['street'],
                        unit: studio['address']['unit'],
                        postal: parseInt(studio['address']['postal'])
                    },
                    bookingsRequired: studio.bookingsRequired,
                    otherServices: returnArray(studio.otherServices)
                })
            } else {
                res.status(400)
                res.send(validateStudio)
            }
        }

        let studioToInsert = await db.collection('studio_data').findOne({
            'address.unit': studio['address']['unit'],
            'address.postal': parseInt(studio['address']['postal'])

        })

        studio = studioToInsert;

        let validateArtist = "";
        if (!name || name.length < 3) {
            validateArtist += 'please ensure that your name contains 3 or more characters \n'
        }

        if (!yearStarted || yearStarted == NaN) {
            validateArtist += 'please ensure that you enter a valid year \n'
        }

        if (method == []) {
            validateArtist += 'please ensure that you select at least one method \n'
        }

        if (style == [] || !style || style.length > 3 || style == null) {
            validateArtist += 'please ensure that you select at least one and at most 3 styles \n'
        }

        if (ink == []) {
            validateArtist += 'please ensure that you select at least one type of ink \n'
        }

        //to do front-end validation for key/value
        if (Object.keys(contact).length == 0 || !contact) {
            validateArtist += 'please enter at least one form of contact'
        }

        if (images == [] || images.length > 3) {
            validateArtist += 'please provide at least one image and at most 3'
        }

        //validating owner
        if (!owner.name || owner.name.length < 3) {
            validateArtist += 'please ensure that your name contains 3 or more characters \n'
        }

        if (!owner.email || !owner.email.includes('@') || !owner.email.includes('.com')) {
            validateArtist += 'please ensure that you enter a valid email \n'
        }

        if (validateStudio == "") {
            if (validateArtist == "") {
                let result = await db.collection('tattoo_artists').insertOne({
                    name: name,
                    gender: gender,
                    yearStarted: yearStarted,
                    yearsOfExperience: (currentYear - yearStarted),
                    apprentice: apprentice,
                    method: returnArray(method),
                    temporary: temporary,
                    style: returnArray(style),
                    ink: returnArray(ink),
                    contact: contact,
                    images: images,
                    studio: studio,
                    owner: owner
                });
                res.send(result)
            }
            else {
                res.status(400)
                res.send(validateArtist)
            }
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
        let apprentice = req.body.apprentice;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let images = req.body.images;
        let studio = req.body.studio;
        let owner = req.body.owner;
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id),
        });
        let originalStudioID = artist.studio['_id'];

        //update studio data
        //find the original studio document
        //update

        let validateStudio = "";

        if (owner.email != artist.owner.email) {
            res.status(401)
            res.send('sorry, it seems that you are not the owner of this document!')
        }

        else {

            if (!studio.name) {
                validateStudio += "please enter your studio name \n"
            }

            if (!studio.address.street) {
                validateStudio += "please enter the street name \n"
            }

            if (!studio.address.unit) {
                validateStudio += "please enter the unit \n"
            }

            if (!studio.address.postal || studio.address.postal.length != 6 || parseInt(studio.address.postal == NaN)) {
                validateStudio += "please enter a valid postal code\n"
            }

            if (!studio.otherServices) {
                validateStudio += "please enter nil if no other services \n"
            }

            if (validateStudio == "") {
                let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(originalStudioID)
                },
                    {
                        '$set': {
                            name: studio.name,
                            private: studio.private,
                            address: {
                                street: studio['address']['street'],
                                unit: studio['address']['unit'],
                                postal: parseInt(studio['address']['postal'])
                            },
                            bookingsRequired: studio.bookingsRequired,
                            otherServices: returnArray(studio.otherServices)
                        }
                    })

            } else {
                res.status(500);
                res.send(validateStudio)
            }
        }

        studio = await db.collection('studio_data').findOne({
            _id: ObjectId(originalStudioID)
        })

        let validateArtist = "";
        if (!name || name.length < 3) {
            validateArtist += 'please ensure that your name contains 3 or more characters \n'
        }

        if (!yearStarted || yearStarted == NaN) {
            validateArtist += 'please ensure that you enter a valid year \n'
        }

        if (method == []) {
            validateArtist += 'please ensure that you select at least one method \n'
        }

        if (style == [] || !style || style.length > 3 || style == null) {
            validateArtist += 'please ensure that you select at least one and at most 3 styles \n'
        }

        if (ink == []) {
            validateArtist += 'please ensure that you select at least one type of ink \n'
        }

        //to do front-end validation for key/value
        if (Object.keys(contact).length == 0 || !contact) {
            validateArtist += 'please enter at least one form of contact'
        }

        if (images == [] || images.length > 3) {
            validateArtist += 'please provide at least one image and at most 3'
        }

        if (validateStudio == "") {
            if (validateArtist == "") {
                let result = await db.collection('tattoo_artists').updateOne({
                    _id: ObjectId(req.params.id)
                },
                    {
                        '$set': {
                            name: name,
                            gender: gender,
                            yearStarted: yearStarted,
                            yearsOfExperience: (currentYear - yearStarted),
                            apprentice: apprentice,
                            method: returnArray(method),
                            temporary: temporary,
                            style: returnArray(style),
                            studio: studio,
                            ink: returnArray(ink),
                            contact: contact,
                            images: images
                        }
                    });

            } else {
                res.status(500);
                res.send(validateArtist);
            }
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
    app.post('/tattoo-artist/:id/add-review', async function (req, res) {
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
                    rating: parseInt(rating),
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

    //READ REVIEWS
    app.get('/tattoo-artist/:id', async function (req, res) {
        let artistID = req.params.id
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(artistID)
        });
        res.send(artist.reviews)
    })

    //READ SINGLE REVIEW
    app.get('/reviews/:reviewid/edit', async function (req, res) {
        let result = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(req.params.reviewid)
        }, {
            projection: {
                'reviews': {
                    $elemMatch: {
                        _id: ObjectId(req.params.reviewid)
                    }
                }
            }
        });
        //projection returns an array
        let wantedReview = result.reviews[0];
        res.send(wantedReview)
    })

    //UPDATE REVIEW
    app.post('/reviews/:reviewid/edit', async function (req, res) {
        let result = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(req.params.reviewid)
        });
        let updated = await db.collection('tattoo_artists').updateOne({
            'reviews._id': ObjectId(req.params.reviewid)
        }, {
            $set: {
                'reviews.$.comment': req.body.comment
            }
        })
        console.log(updated);
        let updatedResult = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(updatedResult._id)
        }, {
            projection: {
                'reviews': {
                    $elemMatch: {
                        _id: ObjectId(req.params.reviewid)
                    }
                }
            }
        })
        res.send(updatedResult)
    })

    //DELETE REVIEW
    app.get('/reviews/:reviewid/delete', async function (req, res) {
        let result = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(req.params.reviewid)
        });
        console.log(result)
        await db.collection('tattoo_artists').updateOne({
            _id: ObjectId(result._id)
        }, {
            $pull: {
                'reviews': {
                    _id: ObjectId(req.params.reviewid)
                }
            }
        })
        res.send('delete completed')
    })

}
main();

app.get('/', function (req, res) {
    res.send(`<img src='https://images.squarespace-cdn.com/content/v1/5a3cc369914e6bb0df95edd9/1644838962846-NRM64EQKMI3Z6L3MSL0A/IMG_6343.JPG?format=2500w'/>`)
})


app.listen(8888, function () {
    console.log('server started')
})