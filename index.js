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
            otherServices: returnArray(otherServices)
        };
        let ownerName = req.body.ownerName.toLowerCase();
        let ownerEmail = req.body.ownerEmail.toLowerCase();
        // let ownerName = req.body.owner.name.toLowerCase();
        // let ownerEmail = req.body.owner.email.toLowerCase();

        //must send body over -> owner name

        //or comparator => empty string => if react didnt send anything then will create empty string instead
        //to pass studio object by reference => check if objectid already exists in database by postal code & unit-number
        //if yes, then pass studio object by reference
        //if not, create new studio object

        let matchingStudio = await db.collection('studio_data').findOne({
            'address.unit': unit,
            'address.postal': postal
        })

        let validateStudio = "";

        if (!studioName) {
            validateStudio += "please enter your studio name \n"
        }

        if (!street) {
            validateStudio += "please enter the street name \n"
        }

        if (!unit) {
            validateStudio += "please enter the unit \n"
        }

        if (!postal || postal.length != 6 || parseInt(postal) == NaN) {
            validateStudio += "please enter a valid postal code\n"
        }

        if (!otherServices) {
            validateStudio += "please enter nil if no other services \n"
        }

        if (matchingStudio != null) {
            if (validateStudio == "") {
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
                            otherServices: returnArray(otherServices)
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
                    name: studioName.toLowerCase(),
                    private: private,
                    address: {
                        street: street,
                        unit: unit,
                        postal: postal
                    },
                    bookingsRequired: bookingsRequired,
                    otherServices: returnArray(otherServices)
                })
            } else {
                res.status(400)
                res.send(validateStudio)
            }
        }

        let studioToInsert = await db.collection('studio_data').findOne({
            'address.unit': unit,
            'address.postal': postal

        })

        studio = studioToInsert;

        let validateArtist = "";
        if (!name || name.length < 3) {
            validateArtist += 'please ensure that your name contains 3 or more characters \n'
        }

        if (!yearStarted || yearStarted == NaN) {
            validateArtist += 'please ensure that you enter a valid year \n'
        }

        if (method == [] || method.length == 0) {
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

        if (!image) {
            validateArtist += 'please provide at least one image'
        }

        //validating owner
        if (!ownerName || ownerName.length < 3) {
            validateArtist += 'please ensure that your name contains 3 or more characters \n'
        }

        if (!ownerEmail || !ownerEmail.includes('@') || !ownerEmail.includes('.com')) {
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
                    image: image,
                    studio: studio,
                    owner: {
                        name: ownerName,
                        email: ownerEmail
                    }
                });
                res.status(200)
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
        //name

        if (req.query.search){
            let nameCriteria = {};
            nameCriteria['name'] = {
                $regex: req.query.search,
                $options: "i"
            }
            let studioNameCriteria ={};
            studioNameCriteria['studio.name'] = {
                $regex: req.query.search,
                $options: "i"
            }
            let instagramCriteria = {};
            instagramCriteria['contact.contactValue'] = {
                $regex: req.query.search,
                $options: "i"
            }
            criteria = {$or : [nameCriteria, studioNameCriteria, instagramCriteria]}
        };

        if (req.query.name) {
            criteria['name'] = {
                $regex: req.query.name,
                $options: "i"
            }
        }

        //gender
        if (req.query.gender) {
            criteria['gender'] = {
                $regex: req.query.gender,
                $options: "i"
            }
        }

        //years of experience -> have to filter by min years
        if (req.query.yearsOfExperience) {
            criteria['yearsOfExperience'] = {
                $gt: parseInt(req.query.yearsOfExperience)
            }
        }

        //check if an array contains the value?
        //method
        if (req.query.method) {
            let methodQuery = req.query.method;
            let methodArr = [];
            if (!methodQuery.includes(',')) {
                methodArr = [methodQuery]
            }
            else {
                methodArr = req.query.method.split(',');
            }

            criteria['method'] = {
                $all: methodArr
            }
        }
        // $in: [
        //     req.query.method
        // ]

        //temporary
        if (req.query.temporary) {
            criteria['temporary'] = {
                $regex: req.query.temporary,
                $options: "i"
            }
        }

        //style
        if (req.query.style) {
            let styleQuery = [];
            if (!req.query.style.includes(',')) {
                styleQuery = [req.query.style]
            }
            else {
                styleQuery = req.query.style.split(',')
            }
            criteria['style'] = {
                $all: styleQuery
            }
        }

        //ink
        if (req.query.ink) {
            let inkQuery = [];
            if (!req.query.ink.includes(',')) {
                inkQuery = [req.query.ink]
            }
            else {
                inkQuery = req.query.ink.split(',')
            }
            criteria['ink'] = {
                $all: inkQuery //have to convert before putting in 
            }
        }

        //private studio
        if (req.query.privateStudio) {
            criteria['studio.private'] = {
                $regex: req.query.privateStudio,
                $options: "i"
                // private: {
                //     $regex: req.query.privateStudio,
                //     $options: "i"
                // }
            }
        }

        //studio bookings required
        if (req.query.bookingsRequired) {
            criteria['studio.bookingsRequired'] = {
                $regex: req.query.bookingsRequired,
                $options: "i"
            }
        }

        //studio other services
        if (req.query.otherServices) {
            criteria['studio.otherServices'] = {
                $regex: req.query.otherServices,
                $options: "i"
            }
        }

        //reviews ratings


        //elemMatch only for things embedded within an array?
        //validation for query required?
        if (req.query.instagram) {
            criteria['contact.instagram'] = {
                $regex: req.query.instagram,
                $options: "i"
            }
        }

        if (req.query.phone) {
            criteria['contact.phone'] = req.query.phone
        }

        console.log(criteria)
        let results = await db.collection('tattoo_artists').find(criteria,
            // {
            //     projection: {
            //         name: 1, yearsOfExperience: 1, gender: 1, method: 1, style: 1, ink: 1, contact: 1, studio: { private: 1, bookingsRequired: 1 }
            //     }
            // }
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
    app.put('/tattoo-artist/:id', async function (req, res) {
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
        let studio = {
            name: studioName.toLowerCase(),
            private: private,
            address: {
                street: street,
                unit: unit,
                postal: postal
            },
            bookingsRequired: bookingsRequired,
            otherServices: returnArray(otherServices)
        };
        let artist = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id),
        });
        let originalStudioID = artist.studio['_id'];
        console.log(postal)
        //update studio data
        //find the original studio document
        //update

        let validateStudio = "";

        if (ownerEmail != artist.owner.email) {
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

            if (!studio.address.postal || studio.address.postal.length != 6 || parseInt(studio.address.postal) == NaN) {
                validateStudio += "please enter a valid postal code \n"
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
                            name: studioName.toLowerCase(),
                            private: private,
                            address: {
                                street: street.toLowerCase(),
                                unit: unit,
                                postal: postal
                            },
                            bookingsRequired: bookingsRequired,
                            otherServices: returnArray(otherServices)
                        }
                    })

            } else {
                res.status(422);
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
        if (contact.length == 0) {
            validateArtist += 'please enter at least one form of contact'
        }

        if (!image) {
            validateArtist += 'please provide at least one image'
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
                            image: image
                        }
                    });
                res.status(200)
                res.send('entry successfully updated')

            } else {
                res.status(422);
                res.send(validateArtist);
            }
        }
    })

    //DELETE MAIN
    app.delete('/tattoo-artist/:id', async function (req, res) {
        let email = req.body.email;
        console.log(req.body)
        let recordToDelete = await db.collection('tattoo_artists').findOne({
            _id: ObjectId(req.params.id)
        })
        console.log(email)
        console.log(recordToDelete)
        console.log(recordToDelete.owner.email)
        if (email == recordToDelete.owner.email) {
            let results = await db.collection('tattoo_artists').deleteOne({
                _id: ObjectId(req.params.id)
            });
            res.status(200);
            res.send({
                message: 'entry successfully deleted'
            })
        }
        else {
            res.status(400)
            res.send('sorry it seems that you are not the owner of this document!')
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

        let validateReview = ""
        if (!reviewer || reviewer.length < 3) {
            validateReview += "please ensure that your name is at least 3 characters long \n"
        }
        if (!email || !email.includes('@') || !email.includes('.com')) {
            validateReview += "please ensure that you enter a valid email \n"
        }
        if (!rating || rating == NaN) {
            validateReview += "please select a rating \n"
        }
        if (!comment) {
            validateReview += "please enter your review \n"
        }

        if (validateReview == "") {
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
            res.send(validateReview)
        }
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

        let validateReview = "";
        if (email != result.reviews[0].email) {
            validateReview += "sorry, it seems that you are not the owner of this review! \n"
        }
        if (!reviewer || reviewer.length < 3) {
            validateReview += "please ensure that your name is at least 3 characters long \n"
        }
        if (!rating || rating == NaN) {
            validateReview += "please select a rating \n"
        }
        if (!comment) {
            validateReview += "please enter your review \n"
        }

        if (validateReview == "") {
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
            res.send(updatedResult)
        }
        else {
            res.status(422);
            res.send(validateReview)
        }
    })

    //DELETE REVIEW
    app.get('/reviews/:reviewid/delete', async function (req, res) {
        let result = await db.collection('tattoo_artists').findOne({
            'reviews._id': ObjectId(req.params.reviewid)
        });
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
        res.send('delete completed')
    })

}
main();

app.get('/', function (req, res) {
    res.send(`<img src='http://drive.google.com/uc?export=view&id=1t6xnQj0upRS_ErtEWeEZJWaqpM7x3RsG'/>`)
})


app.listen(8888, function () {
    console.log('server started')
})