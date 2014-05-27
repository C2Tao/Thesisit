//modules
var request = require("request");
var cheerio = require("cheerio");

var webapi = "http://www.kimonolabs.com/api/ehhgwf40?apikey=fb110eb5d4c1775fbf3e9840e88f4f3a";

var re = new RegExp('VALUE','g');
var queryStr = 'QQ';
var queryPattern = '&query=VALUE&querydisp=VALUE';
var flatPageOpt = '&preflayout=flat';

var titleSelector = 'td > div > div.large-text > h1.mediumb-text > strong';
var unknownSelector //= 'td > table:nth-child(2).medium-text > tbody:nth-child(2) > tr:nth-child(1n + 1) > td:nth-child(2)';
='td > table:nth-child(2).medium-text > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2)';

//console.log(queryPattern.replace(re,queryStr));

request(webapi+queryPattern.replace(re,queryStr), 
function(err, response, body) {
    if(!err) {
        var obj = JSON.parse(body);
        console.log(obj.results.papers[0].title);
        
        var flatPageOpt = '&preflayout=flat';
        request(obj.results.papers[0].title.href + flatPageOpt,
            function(err, response, htmlSnippet) {
                $ = cheerio.load(htmlSnippet);
                console.log($(unknownSelector));

        });
    }
    else {
        console.log(err);
    }
});