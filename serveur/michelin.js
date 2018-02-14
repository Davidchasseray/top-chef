var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function getNumberOfPages(url, callback) {
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            var nbr = $('ul.pager').children('.last').prev().children().html();
            callback(nbr);
        }
    });
}

function loadUrls(url, callback) {
    var page_urls = [];
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('a[class=poi-card-link]').each(function (i, elem) {
                page_urls.push('https://restaurant.michelin.fr' + $(elem).attr('href'));
            });
            callback(page_urls);
        }
    });
}

function getInfoFromUrl(url, callback) {
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            var name = $('h1').first().text();
            var road = $('.thoroughfare').first().text();
            var zipcode = $('.postal-code').first().text();;
            var city = $('.locality').first().text();
            var chef = $('.field--name-field-chef').children('.field__items').text();
            var restaurant = {
                "name": name,
                "road": road,
                "zipcode": zipcode,
                "city": city,
                "address": road + ' ' + zipcode + ' ' + city,
                "chef": chef,
                "url": url
            };
            callback(restaurant);
        }
    });
}

function scrapeFromUrl(url) {
    var json = { "restaurants": [] };
    getNumberOfPages(url, function (nbr) {
        for (var i = 1; i < +nbr + 1; i++) {
            loadUrls(url + '/page-' + i.toString(), function (arr) {
                arr.forEach(function (elem) {
                    getInfoFromUrl(elem, function (restaurant) {
                        json.restaurants.push(restaurant);
                        fs.writeFile('restaurants.json', JSON.stringify(json), 'utf8', function (err) {
                            if (!err) {
                                console.log('One restaurant has been added.');
                            }
                            else {
                                return console.log(err);
                            }
                        });
                    });
                });
            });
        }
    });
}


function get() {
    if (!fs.existsSync('./restaurants.json')) {
        scrapeFromUrl('https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin');
        return console.log('Scrapping in progress, please retry.');
    }
    var content = fs.readFileSync('./restaurants.json', 'utf-8');
    return JSON.parse(content);
}

exports.get = get;
