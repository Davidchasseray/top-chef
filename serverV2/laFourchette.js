const request = require('request');
const fs = require('fs');
const similarity = require('similarity');
const michelin = require('./michelin');
const apiSearch = 'https://m.lafourchette.com/api/restaurant/search?&offer=0&origin_code_list[]=THEFORKMANAGER&limit=400';
const apiRestaurantWithoutId = 'https://m.lafourchette.com/api/restaurant/';

function searchRestaurant(restaurant) {
    restaurant.isOnLafourchette = false;
    var matchPerc = 0.6;
    const options = {
        'uri': apiSearch + `&search_text=${encodeURIComponent(restaurant.nameOnMichelin)}`,
        'json': true
    };
    return new Promise((resolve, reject) => {
        request(options, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            body.items.forEach((resultRestaurant) => {
                if (restaurant.address.postal_code === resultRestaurant.address.postal_code && similarity(restaurant.address.address_road, resultRestaurant.address.street_address) > matchPerc) {
                    matchPerc = similarity(restaurant.address.address_road, resultRestaurant.address.street_address);
                    restaurant.nameOnLaFourchette = resultRestaurant.name;
                    restaurant.id = resultRestaurant.id;
                    restaurant.urlOnLaFourchette = `https://www.lafourchette.com/restaurant/${encodeURIComponent(restaurant.nameOnLaFourchette)}/${restaurant.id}`;
                    restaurant.geo = resultRestaurant.geo;
                    restaurant.phoneNumber = resultRestaurant.phoneNumber;
                    restaurant.isOnLafourchette = true;
                }
            });
            return resolve(restaurant);
        });
    });
}

function writeResult(jsonResult) {
    return new Promise((resolve, reject) => {
        fs.writeFile('restaurantsBis.json', JSON.stringify(jsonResult), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function findRestausOnLaFourch() {
    restaurants = michelin.get();
    if (restaurants) {
        requests = restaurants.map((restaurant) => searchRestaurant(restaurant));
        Promise.all(requests)
            .then(((result) => {
                writeResult(result);
            }))
            .then(() => console.log("Restaurants are updated"))
            .catch((err) => console.log(err));
    }
    else {
        console.log('Wait');
    }
}

function getCompleteRestaurantInfos() {
    if (!fs.existsSync('./restaurantsBis.json')) {
        console.log('Scrapping in progress, please retry.');
        findRestausOnLaFourch();
        return 0;
    }
    else {
        var content = fs.readFileSync('./restaurantsBis.json', 'utf-8');
        return JSON.parse(content);
    }
}

function getDealsById(restaurant) {
    restaurant.sales = []
    return new Promise((resolve, reject) => {
        if (restaurant.isOnLafourchette) {
            request(apiRestaurantWithoutId + `${restaurant.id}/sale-type`, (err, resp, body) => {
                if (err) {
                    return reject(err);
                }
                restaurant.sales = JSON.parse(body);
                return resolve(restaurant);
            });
        }
        else {
            return resolve(restaurant);
        }
    });
}

function get(restaurant) {
    content = getCompleteRestaurantInfos();
    if (content) {
        var result = content.find((rest) => {
            return rest.nameOnMichelin == restaurant.nameOnMichelin;
        });
        getDealsById(result)
            .then((res) => console.log(res.sales))
            .catch((err) => console.log(err));
    }
}

exports.getAll = getCompleteRestaurantInfos;
exports.get = get;