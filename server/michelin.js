var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
const researcheUrl = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';



function getInfo(pageUrl) {
    var restaurant = {
        "urlOnMichelin": `https://restaurant.michelin.fr${pageUrl}`,
        "address": {}
    };
    return new Promise((resolve, reject) => {
        request(restaurant.urlOnMichelin, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            const $ = cheerio.load(body);
            restaurant.nameOnMichelin = $('h1').first().text();
            restaurant.address.address_road = $('.thoroughfare').first().text();
            restaurant.address.postal_code = $('.postal-code').first().text();
            restaurant.address.address_locality = $('.locality').first().text();
            restaurant.chef = $('.field--name-field-chef > .field__items').text();
            restaurant.stars = 1;
            if ($('span').hasClass('icon-cotation2etoiles')) {
                restaurant.stars = 2;
            }
            if ($('span').hasClass('icon-cotation3etoiles')) {
                restaurant.stars = 3;
            }
            return resolve(restaurant);
        });
    });
}

function getTotalNbOfPages() {
    var totalNbOfPages;
    return new Promise((resolve, reject) => {
        request(researcheUrl, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            const $ = cheerio.load(body);
            totalNbOfPages = $('.mr-pager-first-level-links > li').last().prev().text();
            return resolve(totalNbOfPages);
        });
    });
}

function getRestaurantsUrlsOnPage(pageNum) {
    var restaurantsUrlForThePage = [];
    var url = researcheUrl+`/page-${pageNum}`;
    return new Promise((resolve, reject) => {
        request(url, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            const $ = cheerio.load(body);
            $('a.poi-card-link').each((i, elem) => {
                restaurantsUrlForThePage.push($(elem).attr('href'));
                return resolve(restaurantsUrlForThePage);
            });
        });
    });
}

function getRequestsInOneList(restaurantsPages) {
    listOfRequest = [];
    restaurantsPages.forEach((restaurantsPage) => {
        restaurantsPage.forEach((restaurantPage) => {
            listOfRequest.push(getInfo(restaurantPage));
        });
    });
    return listOfRequest;
}

function writeResultInJsonDocInJsonDoc(jsonResult) {
    return new Promise((resolve, reject) => {
        fs.writeFile('restaurants.json', JSON.stringify(jsonResult), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

async function scrapingOnMichelinForInfos() {
    var restaurantsPagesNbr = [];
    var restaurantsPagesReq;
    var restaurantsPages;
    var restaurantsInfoReq;
    console.log("Get the number of pages");
    await getTotalNbOfPages()
        .then((result) => {
            for (var page = 1; page < +result + 1; page++) {
                restaurantsPagesNbr.push(page);
            }
        })
        .catch((err) => console.log(err));
    restaurantsPagesReq = restaurantsPagesNbr.map((pageNum) => getRestaurantsUrlsOnPage(pageNum));
    console.log("Fetch all restaurants' urls");
    await Promise.all(restaurantsPagesReq)
        .then((result) => {
            restaurantsPages = result;
        })
        .catch((err) => console.log(err));
    restaurantsInfoReq = getRequestsInOneList(restaurantsPages);
    console.log("Send the requests");
    Promise.all(restaurantsInfoReq)
        .then((result) => {
            console.log("Write in file");
            writeResultInJsonDocInJsonDoc(result);
        })
        .then(() => console.log('The file has been written!'))
        .catch((err) => (console.log(err)));
}

function get() {
    if (!fs.existsSync('./restaurants.json')) {
        console.log('Scrapping in progress, please retry.');
        scrapingOnMichelinForInfos();
        return 0;
    }
    var content = fs.readFileSync('./restaurants.json', 'utf-8');
    return JSON.parse(content);
}

exports.get = get;