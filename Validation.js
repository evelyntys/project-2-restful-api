function validateStudio(studioName, street, unit, postal, services) {
    let validateStudio = [];

    if (!studioName) {
        validateStudio.push({
            studioName: "please enter your studio name "
        })
    }

    if (!street) {
        validateStudio.push({
            street: "please enter the street name"
        })
    }

    if (!unit || !unit.includes('#') || !unit.includes('-')) {
        validateStudio.push({
            unit: "please enter the unit and ensure that it includes a '#' and '-'"
        })
    }

    if (!postal || postal.length != 6 || parseInt(postal) == NaN) {
        validateStudio.push({
            postal: "please enter a valid postal code"
        })
    }

    if (services.length == 0) {
        validateStudio.push({
            otherServices: "please enter nil if no other services"
        })
    }
    return validateStudio
}

function validateArtist(name, yearStarted, method, style, ink, contact, image) {
    let validateArtist = [];
    if (!name || name.length < 2) {
        validateArtist.push({
            artistName: 'please ensure that the artist name contains 2 or more characters'
        })
    }

    if (!yearStarted || yearStarted == NaN) {
        validateArtist.push({
            yearStarted: 'please ensure that you enter a valid year'
        })
    }

    if (method == [] || method.length == 0) {
        validateArtist.push({
            method: 'please ensure that you select at least one method'
        })
    }

    if (style == [] || !style || style.length > 3 || style == null) {
        validateArtist.push({
            style: 'please ensure that you select at least one and at most 3 styles'
        })
    }

    if (ink == []) {
        validateArtist.push({
            ink: 'please ensure that you select at least one type of ink'
        })
    }

    if (Object.keys(contact).length == 0 || !contact) {
        validateArtist.push({
            contact: 'please enter at least one form of contact'
        })
    }

    let instagram = contact.find((element) => {
        return element.contactKey === 'instagram';
    })
    if (instagram) {
        if (!instagram.contactValue.includes('@'))
        validateArtist.push({
            instagram: "please include the '@' on your instagram handle"
        })
        else{
            null
        }
    }
    else{
        validateArtist.push({
            instagram: "please ensure that you include your instagram"
        })
    }   

    if (!image) {
        validateArtist.push({
            image: 'please provide an image link'
        })
    }
    return validateArtist
}

    module.exports = {
        validateStudio,
        validateArtist
    }