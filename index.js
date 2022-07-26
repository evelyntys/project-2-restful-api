const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const MONGOURI = process.env.MONGO_URI;
const CheckIfArray = require('./CheckIfArray');
const Validation = require('./Validation')

let app = express();

app.use(express.json());
app.use(cors());

async function main() {
    let db = await MongoUtil.connect(MONGOURI, 'tattoo_API');
    let currentYear = 2022;

    // CREATE MAIN
    app.post('/add-new-artist', async function (req, res) {
        let name = req.body.name.toLowerCase();
        let gender = req.body.gender;
        let yearStarted = parseInt(req.body.yearStarted);
        let apprentice = req.body.apprentice;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let image = req.body.image;
        let studioName = req.body.studioName;
        let private = req.body.private;
        let bookingsRequired = req.body.bookingsRequired;
        let street = req.body.street.toLowerCase();
        let unit = req.body.unit;
        let postal = req.body.postal;
        let otherServices = req.body.otherServices;
        let studio = {
            name: studioName.toLowerCase(),
            private: private,
            address: {
                street: street,
                unit: unit,
                postal: postal
            },
            bookingsRequired: bookingsRequired,
            otherServices: CheckIfArray.returnArray(otherServices)
        };
        let ownerName = req.body.ownerName.toLowerCase();
        let ownerEmail = req.body.ownerEmail.toLowerCase();
        let styleValues = style.map(value => value.value);
        // console.log(studio)
        //must send body over -> owner name

        //or comparator => empty string => if react didnt send anything then will create empty string instead
        //to pass studio object by reference => check if objectid already exists in database by postal code & unit-number
        //if yes, then pass studio object by reference
        //if not, create new studio object

        let matchingStudio = await db.collection('studio_data').findOne({
            'address.unit': unit,
            'address.postal': postal
        })

        let validateStudioMsg = Validation.validateStudio(studioName, street, unit, postal, otherServices);

        if (matchingStudio != null) {
            if (validateStudioMsg.length == 0) {
                let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(matchingStudio._id)
                },
                    {
                        '$set': {
                            name: studioName.toLowerCase(),
                            private: private,
                            address: {
                                street: street,
                                unit: unit,
                                postal: postal
                            },
                            bookingsRequired: bookingsRequired,
                            otherServices: CheckIfArray.returnArray(otherServices)
                        }
                    })
                res.status(200);
                // res.json({ message: 'studio successfully updated' })
            } else {
                res.status(400);
                res.json({ message: validateStudioMsg })
            }
        }

        else {
            if (validateStudioMsg.length == 0) {
                let insertSuccess = await db.collection('studio_data').insertOne({
                    name: studioName.toLowerCase(),
                    private: private,
                    address: {
                        street: street,
                        unit: unit,
                        postal: postal
                    },
                    bookingsRequired: bookingsRequired,
                    otherServices: CheckIfArray.returnArray(otherServices)
                })
                res.status(200);
                // res.json({
                //     message: 'studio succesfully added'
                // })
            } else {
                res.status(400)
                res.json({ message: validateStudioMsg })
            }
        }

        let studioToInsert = await db.collection('studio_data').findOne({
            'address.unit': unit,
            'address.postal': postal

        })

        studio = studioToInsert;

        let validateArtistMsg = Validation.validateArtist(name, yearStarted, method, style, ink, contact, image);

        //validating owner
        if (!ownerName || ownerName.length < 2) {
            validateArtistMsg.push({
                ownerName: 'please ensure that your name contains 2 or more characters'
            })
        }

        if (!ownerEmail || !ownerEmail.includes('@') || !ownerEmail.includes('.com')) {
            validateArtistMsg.push({
                ownerEmail: 'please ensure that you enter a valid email'
            })
        }

        if (validateStudioMsg.length == 0) {
            if (validateArtistMsg.length == 0) {
                let result = await db.collection('tattoo_artists').insertOne({
                    name: name,
                    gender: gender,
                    yearStarted: yearStarted,
                    yearsOfExperience: (currentYear - yearStarted),
                    apprentice: apprentice,
                    method: CheckIfArray.returnArray(method),
                    temporary: temporary,
                    style: styleValues,
                    ink: CheckIfArray.returnArray(ink),
                    contact: contact,
                    image: image,
                    studio: studio,
                    owner: {
                        name: ownerName,
                        email: ownerEmail
                    }
                });
                res.status(200)
                res.json({message: "your listing has been successfully"})
            }
            else {
                res.status(400)
                res.json({ message: validateArtistMsg })
            }
        }
    })

    // READ MAIN
    app.get('/show-artists', async function (req, res) {
        let criteria = {};

        //search box searches for name, studio name and contact fields
        if (req.query.search) {
            let nameCriteria = {};
            nameCriteria['name'] = {
                $regex: req.query.search,
                $options: "i"
            }
            let studioNameCriteria = {};
            studioNameCriteria['studio.name'] = {
                $regex: req.query.search,
                $options: "i"
            }
            let instagramCriteria = {};
            instagramCriteria['contact.contactValue'] = {
                $regex: req.query.search,
                $options: "i"
            }
            criteria = { $or: [nameCriteria, studioNameCriteria, instagramCriteria] }
        };

        //gender
        if (req.query.gender) {
            if (req.query.gender != "any") {
                criteria['gender'] = {
                    $eq: req.query.gender
                }
            }
            else {
                criteria['gender'] = {
                    $ne: req.query.gender
                }
            }
        }

        // apprentice
        if (req.query.apprentice) {
            if (req.query.apprentice != "any") {
                criteria['apprentice'] = {
                    $eq: req.query.apprentice
                }
            }
            else {
                criteria['apprentice'] = {
                    $ne: req.query.apprentice
                }
            }
        }

        // temporary
        if (req.query.temporary) {
            if (req.query.temporary != "any") {
                criteria['temporary'] = {
                    $eq: req.query.temporary
                }
            }
            else {
                criteria['temporary'] = {
                    $ne: req.query.temporary
                }
            }
        }

        if (req.query.yearsOfExperience) {
            criteria['yearsOfExperience'] = {
                $gte: parseInt(req.query.yearsOfExperience)
            }
        }

        //method
        if (req.query.method && req.query.method.length != 0) {
            let methodQuery = CheckIfArray.queryArray(req.query.method)
            console.log(req.query.method)

            criteria['method'] = {
                $all: methodQuery
            }
            console.log(methodQuery)
        }

        // style 
        if (req.query.style?.length) {
            criteria['style'] = {
                $all: req.query.style
            }
            console.log(req.query.style)
        }


        // ink
        if (req.query.ink) {
            let inkQuery = CheckIfArray.queryArray(req.query.ink);
            criteria['ink'] = {
                $all: inkQuery 
            }
        }

        //private
        if (req.query.private && req.query.private.length != 0) {
            if (req.query.private != "any") {
                criteria['studio.private'] = {
                    $eq: req.query.private
                }
            }
            else {
                criteria['studio.private'] = {
                    $ne: req.query.private
                }
            }
        }
        //bookings
        if (req.query.bookings && req.query.bookings.length != 0) {
            if (req.query.bookings != "any") {
                criteria['studio.bookingsRequired'] = {
                    $eq: req.query.bookings
                }
            }
            else {
                criteria['studio.bookingsRequired'] = {
                    $ne: req.query.bookings
                }
            }
        }

        //other services
        if (req.query.otherServices && req.query.otherServices.length != 0) {
            let otherServicesQuery = CheckIfArray.queryArray(req.query.otherServices);

            if (otherServicesQuery.length == 1 && otherServicesQuery.includes('no')) {
                otherServicesQuery[otherServicesQuery.indexOf('no')] = 'nil';
                criteria['studio.otherServices'] = {
                    $in: otherServicesQuery
                }
            }

            else if (otherServicesQuery.length == 1 && !otherServicesQuery.includes('no')) {
                criteria['studio.otherServices'] = {
                    $ne: 'nil'
                }
            }
        }

        let results = await db.collection('tattoo_artists').find(criteria,
        ).toArray();

        res.status(200);
        res.send(results)
    })

    //READ BY ID
    app.get('/tattoo-artist/:id', async function (req, res) {
        let id = req.params.id
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id),
        });
        res.send(artist)
    })

    // UPDATE MAIN
    app.put('/tattoo-artist/:id/edit', async function (req, res) {
        let name = req.body.name.toLowerCase();
        let gender = req.body.gender;
        let yearStarted = parseInt(req.body.yearStarted);
        let apprentice = req.body.apprentice;
        let method = req.body.method;
        let temporary = req.body.temporary;
        let style = req.body.style;
        let ink = req.body.ink;
        let contact = req.body.contact;
        let image = req.body.image;
        let ownerEmail = req.body.ownerEmail;
        let studioName = req.body.studioName;
        let private = req.body.private;
        let bookingsRequired = req.body.bookingsRequired;
        let street = req.body.street.toLowerCase();
        let unit = req.body.unit;
        let postal = req.body.postal;
        let otherServices = req.body.otherServices;
        let styleValues = style.map(value => value.value);
        let studio = {
            name: studioName.toLowerCase(),
            private: private,
            address: {
                street: street,
                unit: unit,
                postal: postal
            },
            bookingsRequired: bookingsRequired,
            otherServices: CheckIfArray.returnArray(otherServices)
        };
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id),
        });
        let originalStudioID = artist.studio['_id'];

        let validateStudioMsg = Validation.validateStudio(studioName, street, unit, postal, otherServices)

        if (ownerEmail != artist.owner.email) {
            res.status(401)
            res.json({ message: 'sorry, it seems that you are not the owner of this document!' })
        }

        else {

            if (validateStudioMsg.length == 0) {
                let updated = await db.collection('studio_data').updateOne({
                    _id: ObjectId(originalStudioID)
                },
                    {
                        '$set': {
                            name: studioName.toLowerCase(),
                            private: private,
                            address: {
                                street: street.toLowerCase(),
                                unit: unit,
                                postal: postal
                            },
                            bookingsRequired: bookingsRequired,
                            otherServices: CheckIfArray.returnArray(otherServices)
                        }
                    })

            } else {
                res.status(422);
                res.json({ message: validateStudioMsg })
            }
        }

        studio = await db.collection('studio_data').findOne({
            _id: ObjectId(originalStudioID)
        })

        let validateArtistMsg = Validation.validateArtist(name, yearStarted, method, style, ink, contact, image);

        if (validateStudioMsg.length == 0) {
            if (validateArtistMsg.length == 0) {
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
                            method: CheckIfArray.returnArray(method),
                            temporary: temporary,
                            style: styleValues,
                            studio: studio,
                            ink: CheckIfArray.returnArray(ink),
                            contact: contact,
                            image: image
                        }
                    });
                res.status(200)
                res.json({ message: 'entry successfully updated' })

            } else {
                res.status(422);
                res.send({ message: validateArtistMsg });
            }
        }
    })

    //DELETE MAIN
    app.delete('/tattoo-artist/:id/delete', async function (req, res) {
        let email = req.query.email;

        let recordToDelete = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id)
        })

        if (email == recordToDelete.owner.email) {
            let results = await db.collection('tattoo_artists').deleteOne({
                _id: ObjectId(req.params.id)
            });
            res.status(200);
            res.json({
                message: 'entry successfully deleted'
            })
        }
        else {
            res.status(400)
            res.json({ message: 'sorry it seems that you are not the owner of this document!' })
        }

    })


    //CREATE REVIEW
    app.post('/tattoo-artist/:id/add-review', async function (req, res) {
        let artistID = req.params.id
        console.log(req.params.id)
        let reviewer = req.body.reviewer.toLowerCase();
        let email = req.body.email.toLowerCase();
        let rating = parseInt(req.body.rating);
        let comment = req.body.comment;

        let validateReview = [];
        if (!reviewer || reviewer.length < 2) {
            validateReview.push({
                reviewer: "please ensure that your name is at least 2 characters long"
            })
        }

        if (!email || !email.includes('@') || !email.includes('.com')) {
            validateReview.push({
                email: "please ensure that you enter a valid email"
            })
        }
        if (!rating || rating == NaN) {
            validateReview.push({
                rating: "please select a rating from 1-5"
            })
        }
        if (!comment) {
            validateReview.push({
                comment: "please enter your review"
            })
        }

        if (validateReview.length == 0) {
            let response = await db.collection('tattoo_artists').updateOne({
                _id: ObjectId(artistID)
            }, {
                $push: {
                    reviews: {
                        _id: new ObjectId(),
                        email: email,
                        reviewer: reviewer,
                        rating: parseInt(rating),
                        comment: comment
                    }
                }
            })
            res.status(200);
            res.send(response);
        }
        else {
            res.status(422);
            res.json({ message: validateReview })
        }
    })

    //READ REVIEWS
    app.get('/tattoo-artist/:id/reviews', async function (req, res) {
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
        },
            {
                projection: {
                    'reviews': {
                        $elemMatch: {
                            _id: ObjectId(req.params.reviewid)
                        }
                    }
                }
            });

        let reviewer = req.body.reviewer.toLowerCase();
        let email = req.body.email.toLowerCase();
        let rating = parseInt(req.body.rating);
        let comment = req.body.comment;

        let validateReview = [];
        if (email != result.reviews[0].email) {
            validateReview.push({
                email: "sorry, it seems that you are not the owner of this review!"
            })
        }
        if (!reviewer || reviewer.length < 2) {
            validateReview.push({
                reviewer: "please ensure that your name is at least 2 characters long"
            })
        }
        if (!rating || rating == NaN) {
            validateReview.push({
                rating: "please select a rating from 1-5"
            })
        }
        if (!comment) {
            validateReview.push({
                comment: "please enter your review"
            }
            )
        }

        if (validateReview.length == 0) {
            let updated = await db.collection('tattoo_artists').updateOne({
                'reviews._id': ObjectId(req.params.reviewid)
            }, {
                $set: {
                    'reviews.$.rating': rating,
                    'reviews.$.comment': comment
                }
            })
            let updatedResult = await db.collection('tattoo_artists').findOne({
                'reviews._id': ObjectId(req.params.id)
            }, {
                projection: {
                    'reviews': {
                        $elemMatch: {
                            _id: ObjectId(req.params.reviewid)
                        }
                    }
                }
            })
            res.status(200);
            res.send(updatedResult)
        }
        else {
            res.status(422);
            res.json(validateReview)
        }
    })

    //DELETE REVIEW
    app.get('/reviews/:reviewid/delete', async function (req, res) {
        let email = req.query.email.toLowerCase();
        let result = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(req.params.reviewid),
        },
            {
                projection: {
                    'reviews': {
                        $elemMatch: {
                            _id: ObjectId(req.params.reviewid)
                        }
                    }
                }
            });
        if (email != result.reviews[0].email) {
            validateReview.push({
                email: "sorry, it seems that you are not the owner of this review!"
            })
        }
        await db.collection('tattoo_artists').updateOne({
            _id: ObjectId(result._id)
        }, {
            $pull: {
                'reviews': {
                    _id: ObjectId(req.params.reviewid)
                }
            }
        })
        res.status(200)
        res.json({ message: 'review has been successfully deleted' })
    })
}

main();

app.get('/', function (req, res) {
    res.send("welcome to the tattoofindwho restful API")
})

app.listen(process.env.PORT, function () {
    console.log('server started')
})