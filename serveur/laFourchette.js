"use strict"
var request = require('request');
var cheerio = require('cheerio');
var similarity = require('similarity');
var fs = require('fs');


/*
function get_info(id, restaurant, nameOnLafourch) {
    url = 'https://www.lafourchette.com/restaurant/' + nameOnLafourch + '/' + id;
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('saleType saleType--specialOffer').children().each(function (i, elem) {
                var AddrOnLafourch = $(elem).find('.resultItem-address').text().trim();
                if (similarity(AddrOnLafourch, restaurant.addr) > matchPerc) {
                    matchPerc = similarity(AddrOnLafourch, restaurant.addr);
                    bestMatchId = $(elem).attr('data-restaurant-id');
                }
            });

            if (res.result.length != 0) {
                console.log(restaurant.name);
                console.log(res);
            }
            else {
                console.log("No Promotion for : " + restaurant.name);
            }
        }
        else {
            console.log('No promotion for : ' + restaurant.name);
        }
    }
}
*/



function update_with_link(restaurant, callback) {
    var matchPerc = 0.7;
    var restaurantURL;
    search_page_nbr(restaurant.name, function (pageNbr) {
        for (var i = 1; i < pageNbr + 1; i++) {
            var url = 'https://www.lafourchette.com/search-refine/' + encodeURIComponent(restaurant.name) + '?page=' + i;
            request(url, function (err, resp, html) {
                if (!err) {
                    const $ = cheerio.load(html);
                    $('.resultContainer').children().children().each(function (i, elem) {
                        var AddrOnLafourch = $(elem).find('.resultItem-address').text().trim();
                        if (similarity(AddrOnLafourch, restaurant.address) > matchPerc) {
                            matchPerc = similarity(AddrOnLafourch, restaurant.address);
                            restaurantURL = $(elem).find('.resultItem-name').children().attr('href');
                        }
                    });
                    if (restaurantURL != undefined) {
                        callback(restaurant, 'https://www.lafourchette.com' + restaurantURL);
                        restaurantURL = undefined;
                    }
                }
            });
        }
    });
}

function link_on_lafourchette(restaurant, url) {
    var jsonfichier = JSON.parse(fs.readFileSync('./adressesLafourch.json', 'utf8'));
    restaurant.AddrOnLafourch = url;
    jsonfichier.restaurants.push(
        restaurant);
    console.log("Added " + restaurant.name + " on the list of referenced  restaurants : n° " + jsonfichier.restaurants.length);
    fs.writeFileSync('./adressesLafourch.json', JSON.stringify(jsonfichier), 'utf8');
}

function search_page_nbr(name, callback) {
    var url = 'https://www.lafourchette.com/search-refine/' + encodeURIComponent(name);
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            var pageNbr = $('.pagination').children().children().last().prev().text().trim();
            if (Number(pageNbr)) {
                callback(pageNbr);
            }
            else {
                callback(1);
            }
        }
        else {
            callback(1);
        }
    });
}




function get(json) {
    if (!fs.existsSync('./adressesLafourch.json')) {
        update(json,true);
        return console.log('Scrapping in progress, please retry.');
    }
    var content = fs.readFileSync('./adressesLafourch.json', 'utf-8');
    return JSON.parse(content);
}

function update(json,toBeUpdated) {
    if (toBeUpdated === true) {
        var jsonAdresses = { "restaurants": [] };
        fs.writeFileSync('./adressesLafourch.json', JSON.stringify(jsonAdresses), 'utf8');
        if (json != undefined) {
            for (var i = 1; i < json.restaurants.length; i++) {
                update_with_link(json.restaurants[i], link_on_lafourchette);
            }
        }
    }
}

exports.updateLafourch = update;
exports.get = get;