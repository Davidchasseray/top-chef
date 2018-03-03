const laFourchette = require('./laFourchette');
const express = require('express');

const restaurants = laFourchette.getAll();
const app = express();

// --- Routes --- //

app.get('/api', (req, res) => {
    res.send('/api/restaurant for retrieving restaurant data <br /> /api/offer/id for retrieving promotion');
});

app.get('/api/restaurant', (req, res) => {
    var onLaF = req.query.isOnLafourchette;
    if (onLaF == 1){
        var refRestaurants = [];
        restaurants.find((restaurant) => {
            if (restaurant.isOnLafourchette)
            {
                refRestaurants.push(restaurant);
            }
        });
        res.send(refRestaurants);
    }
    else {
        res.send(restaurants);
    }
});

app.get('/api/restaurant/:id', (req, res) => {
    res.send(restaurants[req.params.id]);
});


app.get('/api/offer/:id', (req, res) => {
    laFourchette.get(restaurants[req.params.id],res);
});

if (restaurants) {
    app.listen(3001, () => {
        console.log('The server is running on https://localhost:3001');
    });
}
