"use strict"
var request = require('request');
var cheerio = require('cheerio');
var similarity = require('similarity');
var fs = require('fs');

function link_on_lafourchette(id, restaurant, nameOnLafourch) {
    if (!fs.existsSync('./adressesLafourch.json')) {
        var json = { "restaurants": [] };
        fs.writeFile('./adressesLafourch.json', JSON.stringify(json), 'utf8');
    }
    var jsonfichier = JSON.parse(fs.readFileSync('./adressesLafourch.json'));
    jsonfichier.restaurants.push({
        "nameOnMichelin": restaurant.name,
        "urlOnLafourch": 'https://www.lafourchette.com/restaurant/' + nameOnLafourch + '/' + id
    });
    fs.writeFile('./adressesLafourch.json', JSON.stringify(jsonfichier), 'utf8');
}
/*
function get_info(id, restaurant, nameOnLafourch) {
    url = 'https://www.lafourchette.com/restaurant/' + nameOnLafourch + '/' + id;
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('saleType saleType--specialOffer').children().each(function (i, elem) {
                var resultAddr = $(elem).find('.resultItem-address').text().trim();
                if (similarity(resultAddr, restaurant.addr) > matchPerc) {
                    matchPerc = similarity(resultAddr, restaurant.addr);
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

function get_id_by_name_addr(restaurant, callback) {
    var url2 = 'https://m.lafourchette.com/api/restaurant-prediction?name=' + encodeURIComponent(restaurant.name);
    var bestMatchId;
    var nameOnLafourch;
    var matchPerc = 0.6;
    request({ url: url2, json: true }, function (err, resp, body) {
        if (!err) {
            try {
                if (body.length > 0) {
                    body.forEach(function (element) {
                        if (element.address.postal_code === restaurant.zipcode) {
                            if (similarity(element.name, restaurant.name) > matchPerc) {
                                matchPerc = similarity(element.name, restaurant.name);
                                bestMatchId = element.id;
                                nameOnLafourch = element.name;
                                nameOnLafourch = nameOnLafourch.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                                nameOnLafourch = nameOnLafourch.replace(/'/g, "-");
                                nameOnLafourch = nameOnLafourch.replace(/ /g, "-");
                                nameOnLafourch = nameOnLafourch.toLowerCase();
                                if(bestMatchId!=undefined){
                                callback(bestMatchId, restaurant, nameOnLafourch);}
                                else {
                                    console.log(restaurant.name + ' is Not referenced on LaFourchette');
                                }
                            }
                        }
                    });
                }
                /*if (bestMatchId != undefined) {
                    console.log(bestMatchId);
                    callback(bestMatchId, restaurant, nameOnLafourch);
                    
                }
                else {
                    console.log(restaurant.name + ' is Not referenced on LaFourchette');
                }*/
            }
            catch (error) {
                console.log(error);
            }
        }
    });
}

function get(restaurant) {
    get_id_by_name_addr(restaurant, get_info)
}

function update(restaurant){
    get_id_by_name_addr(restaurant, link_on_lafourchette)

}

exports.updateLafourch = update;
exports.get = get;