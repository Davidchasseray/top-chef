
var request = require('request');
var cheerio = require('cheerio');

function loadUrl(mainUrl, callback) {
    var urls = [];
    //var p = new Promise(function(resolve,rejct){
    request(mainUrl, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('a[class=poi-card-link]').each(function (i, elem) {
                urls.push($(elem).attr('href'));
                console.log($(elem).attr('href'));
            })
        }

        callback && callback(urls);
    });
    //resolve (urls);
    //}
    //p.then();
    return urls;
}
function getTheRestauUrls() {
    var mainUrl='https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
    var lastUrl = getTheNumberOfPages(mainUrl,function(){
        var i=0;
    while(mainUrl+'/page-'+i.toString() != lastUrl)
    {
        i++
        loadUrl(mainUrl+'/page-'+i.toString(), function (results) {
            console.log(results);
        });
    }
})};
    
getTheRestauUrls();
function getTheNumberOfPages(urlwithoutpages,callback) {
    request(urlwithoutpages, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            return $('li[class="mr-pager-item last"]').children('span').attr('href');
        }
    }
    );
}
function getTheInfosOnWebPage() {

}

function createTheObjectWithNameAndLocation(informations) {

}

// function addOne(thenRunThisFunction) {
//     waitAMinuteAsync(function waitedAMinute() {
//       thenRunThisFunction()
//     })
//   }
//   addOne(function thisGetsRunAfterAddOneFinishes() {})