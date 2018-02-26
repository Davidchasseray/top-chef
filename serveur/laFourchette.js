"use strict"
var request = require('request');
var cheerio = require('cheerio');
var similarity = require('similarity');
var fs = require('fs');




function get_info(restaurants) {
    var restaurant
    var url;
    const options = {
        'uri': '',
        'headers': {
            'cookie': 'datadome=AHrlqAAAAAMAXFWZl3RiUwwALtotww==',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
        }
    };
    for (var j = 1; j < restaurants.length; j++) {
        restaurant = restaurants[j];
        configuration.uri = restaurant.AddrOnLafourch;
        restaurant.reducs = [];
        request(options, function (err, resp, html) {
            if (!err) {
                const $ = cheerio.load(html);
                $('.saleType--specialOffer').each(function (i, elem) {
                    restaurant.reducs.push({
                        "type": "Promotion",
                        "deal": $(elem).find('h3.saleType-title').text()
                    });
                })
                $('.saleType--event').each(function (i, elem) {
                    restaurant.reducs.push({
                        "type": "Evenement",
                        "deal": $(elem).find('h3.saleType-title').text()
                    });
                })
                console.log(restaurant);
            }
        });
    }
}




function update_with_link(restaurant, callback) {
    var matchPerc = 0.7;
    var restaurantURL;
    const options = {
        'uri': '',
        'headers': {
            'cookie': 'datadome=AHrlqAAAAAMAXFWZl3RiUwwALtotww==',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
        }
    };
    search_page_nbr(restaurant.name, function (pageNbr) {
        for (var i = 1; i < pageNbr + 1; i++) {
            options.uri = 'https://www.lafourchette.com/search-refine/' + encodeURIComponent(restaurant.name) + '?page=' + i;
            request(options, function (err, resp, html) {
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
    var json = fs.readFileSync('./adressesLafourch.json', 'utf8');
    var jsonfichier = JSON.parse(json);
    restaurant.AddrOnLafourch = url;
    jsonfichier.restaurants.push(
        restaurant);
    console.log("Added " + restaurant.name + " on the list of referenced  restaurants : n° " + jsonfichier.restaurants.length);
    fs.writeFileSync('./adressesLafourch.json', JSON.stringify(jsonfichier), 'utf8');
}

function search_page_nbr(name, callback) {
    const options = {
        'uri': '',
        'headers': {
            'cookie': 'datadome=AHrlqAAAAAMAXFWZl3RiUwwALtotww==',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
        }
    };
    options.uri = 'https://www.lafourchette.com/search-refine/' + encodeURIComponent(name);
    request(options, function (err, resp, html) {
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
        update(json, true);
        return console.log('Scrapping in progress, please retry.');
    }
    var content = fs.readFileSync('./adressesLafourch.json', 'utf-8');
    return JSON.parse(content);
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


function update(json, toBeUpdated) {
    if (toBeUpdated === true) {
        if (!fs.existsSync('./adressesLafourch.json')) {
            var jsonAdresses = { "restaurants": [] };
            fs.writeFileSync('./adressesLafourch.json', JSON.stringify(jsonAdresses), 'utf8');
        }
        var division = 10;
        if (json != undefined) {
            var j = 0;
            var id = setInterval(() => {
                for (var i = 1 + j * Math.round(json.restaurants.length / division); i < (j + 1) * Math.round(json.restaurants.length / division)-1; i++) {
                    console.log(i);
                    console.log(json.restaurants[i].name);
                    update_with_link(json.restaurants[i], link_on_lafourchette);
                }
                console.log("wait n°" + j);
                j++;
                if(j>=10)
                {
                    clearInterval(id);
                }
                
            }, 3000);
        }
    }
}

exports.updateLafourch = update;
exports.get = get;
exports.getInfos = get_info;