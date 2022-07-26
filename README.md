# Tattoo Artists in SG API
This is a restful API designed for a project on tattoo artists in Singapore, [TattooFindWho](https://tattoofindwho.netlify.app/).
The repository for the React Application can be found [here](https://github.com/evelyntys/project-2-tattoo-artists).

This API was created using MongoDB, and hosted on Heroku.

## 1. Document design
Sample document:
```
{
    "_id": <id given by mongoDB>,
    "name": <artist name>,
    "gender": <artist gender: "female",
    "male" or "others>,
    "yearStarted": <year started tattooing>,
    "yearsOfExperience": <derived from currentYear-yearStarted>,
    "apprentice": <"yes" or "no">,
    "method": <array of methods, values include "handpoke",
    "machine",
    "jagua">,
    "temporary": <"yes" or "no">,
    "style": <array of styles, values include: "surrealism",
    "traditional-americana",
    "traditional-japanese",
    "minimalist",
    "pets/animals",
    "floral",
    "blackwork">,
    "ink": <array of inks, values include: "black",
    "colors",
    "jagua",
    "UV">,
    "contact": <array of objects, with each object being: {
        "contactKey": <value>,
        "contactValue": <value>
    }>,
    "image": <image link>
    "studio": {
        "_id": <id given by mongoDB>,
        "name": <studio name>,
        "private": <"yes" or "no">,
        "address": {
            "street": <studio street>,
            "unit": <studio unit>,
            "postal": <studio postal>
        },
        "bookingsRequired": <"yes" or "no">,
        "otherServices": <array containing a list of services or "nil">
    },
    "owner": {
        "name": <name of document owner>,
        "email": <email of document owner>
    },
    "reviews": [
        {
            "_id": <id given by mongoDB>,
            "email": <reviewer email>,
            "reviewer": <reviewer name>,
            "rating": <integer from 1-5>,
            "comment": <comments>
        }
    ],
}
```
 ## 2. Endpoints
``` 
BASE API URL: 
https://etys-tattoo-artists.herokuapp.com/ 
```
 When successfully connected, it will display the message: 

 <i>welcome to the tattoofindwho resful API</i>

### 2.1 Show all artists in database
<b>Request: </b>

 ```
GET /show-artists
 ```

<b>Response: </b>
 It should return an array of all results in the database

### 2.2 Narrow down listings by searching with criteria(s)
<b>Request: </b>

```
GET /show-artists?query=value
 ```
<b>Examples of queries possible:</b>

show-artists?search= search for artist name, instagram handle or studio name

-----
&gender= "female", "male", "others" or "any"

-----

&yearsOfExperience= "0", "1", "3" or "5"

-----
&apprentice= "yes" or "no"

-----
&temporary= "yes" or "no"

-----

&method= "jagua", "machine", "handpoke"

<i>*To separate values with a comma</i>

-----

&style= "surrealism", "traditional-americana" "traditional-japanese", "minimalist", "pets/animals", "floral",
"blackwork"

<i>*To separate values with a comma</i>

-----

&ink= "black", "colours", "jagua", "uv"

<i>*To separate values with a comma</i>

-----

&private= "yes" or "no"

-----

&bookings= "yes" or "no"

-----
<b>Response: an array of the matching results</b>

### 2.3 Create a new tattoo artist listing:
<b>Request:</b>

```
 POST /add-new-artist
```
<b>Response:</b> your listing has been successfully created

### 2.4 Update an existing tatoo artist listing:
<b>Request:</b>

```
 PUT /tattoo-artist/:id/edit
```

<b>Response:</b> entry successfully updated

### 2.5 Delete an existing tattoo artist listing:
<b>Request:</b>

 ```
 DELETE /tattoo-artist/:id/delete
```
<i>*Please note that an additional query parameter which is the owner's email should be passed in before delete can occur</i>

<b>Response:</b> entry successfully deleted

### 2.6 To read reviews for the artist:
<b>Request:</b>

```
GET /tattoo-artist/:id/reviews
 ```

<b>Response:</b> an array of the reviews available for that artist

### 2.7 Create a new review:

```
POST /tattoo-artist/:id/add-review
```

### 2.8 Update an existing review:

```
POST /reviews/:reviewid/edit
```


### 2.9 To delete reviews:
   ```
GET /reviews/:reviewid/delete?email=<youremail>
 ```
 <i>*Please note that an additional query parameter which is the owner's email should be passed in before delete can occur</i>

 
 ## Testing
 Testing has been conducted using [Advanced Rest Client software](https://install.advancedrestclient.com/install).

## Technologies used
* Express 
* MongoDB