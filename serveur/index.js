var michelin = require('./michelin');
var laFourchette = require('./laFourchette');
var fs = require('fs');
var toBeUpdated = true;
var json = michelin.get();
laFourchette.updateLafourch(json,toBeUpdated);
var jsonLafourch = laFourchette.get(json);
//laFourchette.getInfos(jsonLafourch.restaurants);



