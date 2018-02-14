"use strict"
var request = require('request');
var cheerio = require('cheerio');
var similarity = require('similarity');

function get_info(id,name) {
    if(Number(id)){
        const options = {
                url: 'https://www.lafourchette.com/reservation/module/date-list/' + id,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Charset': 'utf-8',
                    'User-Agent': 'client'
                }
            };
        request(options, function (err, resp, body) {
            if (!err) {
                var json = JSON.parse(body);
                var res = {"result" : []}
                if (json.data.availabilityList != []) {
                    for (var key in json.data.availabilityList) {
                        if (json.data.availabilityList[key].bestSaleType != null) {
                            res.result.push({
                                "date": key,
                                "offer": json.data.availabilityList[key].bestSaleType.title
                            });
                        }
                    }
                    if(res.result.length !=0)
                    {
                        console.log(name);
                        console.log(res);
                    }
                    else
                    {
                        console.log("No Promotion for : "+name);
                    }
                }
                else {
                    console.log('No promotion for : '+name);
                }
            }
        });
    }
    else{
        console.log(name + " cannot be booked on LaFourchette")
    }
}

function get_id_by_name_addr(name, addr, callback) {
    var url = 'https://www.lafourchette.com/search-refine/' + encodeURIComponent(name);
    var bestMatchId;
    var matchPerc = 0.1;
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('.resultContainer').children().children().each(function (i, elem) {
                var resultAddr = $(elem).find('.resultItem-address').text().trim();
                if (similarity(resultAddr, addr) > matchPerc) {
                    matchPerc = similarity(resultAddr, addr);
                    bestMatchId = $(elem).attr('data-restaurant-id');
                }
            });
            if (bestMatchId != undefined) {
                callback(bestMatchId,name);
            }
            else {
                console.log(name + ' is Not referenced on LaFourchette');
            }
        }
    });
}

function get(restaurant) {
    get_id_by_name_addr(restaurant.name,restaurant.address,get_info)
}


exports.get = get;