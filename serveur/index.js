var michelin = require('./michelin');
var laFourchette = require('./laFourchette');

var json = michelin.get();
if (json != undefined) {
    console.log(json.restaurants.length);
    for (var i = 1; i < json.restaurants.length; i++) {

        laFourchette.get(json.restaurants[i]);
    }
}


