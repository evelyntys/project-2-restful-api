# Tattoo Artists in SG API

## 1. Base Url
The API has been deployed on Heroku with the link
``` 
https://etys-tattoo-artists.herokuapp.com/ 
```
When connected, it should show a message saying:

 <i>welcome to the tattoofindwho resful API</i>

 ## 2. GET
 To show ALL listings available, the appropriate endpoint to use is:

 ```
https://etys-tattoo-artists.herokuapp.com/show-artists
 ```

To narrow down the search by criteria, additional query parameters can be added.
 Query    | Value  | Use  
 -------------   | ---------------------   |  ---------
 search| String | Search by artist's name, instagram handle or studio name
 gender| String| Search list by gender
 yearsOfExperience| Integer| Search by minimum years of experience
 Apprentice

 To read reviews for the artist:
```
https://etys-tattoo-artists.herokuapp.com/tattoo-artist/:id/reviews
 ```

 To delete review:
   ```
https://etys-tattoo-artists.herokuapp.com/reviews/:reviewid/delete
 ```
 <i>*Please note that an additional query parameter which is the owner's email should be passed in before delete can occur</i>

 ## 3. POST
 To create a new tattoo artist listing:
  ```
 https://etys-tattoo-artists.herokuapp.com/add-new-artist
```

To create a new review:
```
 https://etys-tattoo-artists.herokuapp.com/tattoo-artist/:id/add-review
```

To update a review:
```
 https://etys-tattoo-artists.herokuapp.com/reviews/:reviewid/edit
```

 ## 4. PUT
 To edit a tattoo artist listing:
```
 https://etys-tattoo-artists.herokuapp.com/tattoo-artist/:id/edit
```

 ## 5. DELETE
 ```
 https://etys-tattoo-artists.herokuapp.com/tattoo-artist/:id/delete
```
<i>*Please note that an additional query parameter which is the owner's email should be passed in before delete can occur</i>

 ## Testing
 Testing has been conducted using [Advanced Rest Client software](https://install.advancedrestclient.com/install).

