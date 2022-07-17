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

function queryArray(query){
    if (!query.includes(',')) {
        arr = [query]
    }
    else {
        arr = query.split(',');
    }
    return arr
}

module.exports = {
    returnArray,
    queryArray
}