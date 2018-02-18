var michelin = require('./michelin');
var laFourchette = require('./laFourchette');
var fs = require('fs');
var toBeUpdated = true;
var json = michelin.get();
laFourchette.updateLafourch(json,toBeUpdated);
var jsonLafourch = laFourchette.get(json);

/*
if (json != undefined) {
    console.log(json.restaurants.length);
    for (var i = 1; i < json.restaurants.length; i++) {
        
        laFourchette.get(json.restaurants[i]);
    }
}
*/


