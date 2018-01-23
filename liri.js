/* Declare all Imports below */
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var keys = require('./keys.js');
var fs = require('fs');
/* Read the arguments to the script */
var userArgArr = process.argv;
var userCommand = userArgArr[2];
var userCommandQuery = "";
for (i = 3; i < userArgArr.length; i++) {
    userCommandQuery = userCommandQuery + "+" + userArgArr[i];
}
consoleLogAndWriteToFile("UserCommand: " + userCommand + " | userCommandQuery: " + userCommandQuery);
var validCommands = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'];
/* Validate if the user Command is valid */
if (!validCommands.includes(userCommand)) {
    consoleLogAndWriteToFile('ERROR: Invalid arguments passed, valid arguments are : ' + validCommands);
    return;
} else {
    // consoleLogAndWriteToFile("##### valid user Command passed #####.")
}

if (userCommand === "do-what-it-says") {
    fs.readFile ('./random.txt', 'utf8', (err, data) => {
        if (err) {
            consoleLogAndWriteToFile(err);
        }
        userCommand = data.split(',')[0];
        userCommandQuery = data.split(',')[1];
        consoleLogAndWriteToFile("do-what-it-says : "+userCommand+" | "+userCommandQuery);
        liriBot(userCommand, userCommandQuery); /* this is the main command for the liriBot commands. */
    });
} else {
    liriBot(userCommand, userCommandQuery); /* this is the main command for the liriBot commands. */
}

/*  
    Perform action based on the usercommand sent
    Twitter(command : my-tweets): display last 20 tweets of the user
    Spotify(command : spotify-this-song): display the details of the song user requested
    Movie(command : movie-this): display the details of the movie user requested
    ReadfromRandomFile(command : do-what-it-says) : reads from random file and performs action as mentioned in file.
*/
function liriBot(userCommand, userCommandQuery) {
    consoleLogAndWriteToFile('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    switch (userCommand) {
        case 'my-tweets':
            var twitterClient = new Twitter({
                consumer_key: keys.twitter.consumer_key,
                consumer_secret: keys.twitter.consumer_secret,
                access_token_key: keys.twitter.access_token_key,
                access_token_secret: keys.twitter.access_token_secret
            });
            var params = {
                screen_name: 'ucb_nav'
            };
            twitterClient.get('statuses/user_timeline', params, (error, tweets, response) => {
                if (!error) {
                    tweets.forEach((tweet, i) => {
                        consoleLogAndWriteToFile("Tweet " + (parseInt(i) + 1) + " : " + tweet.text);
                    })
                }
            });
            break;
        case 'spotify-this-song':
            var songName = "";
            if (userCommandQuery) {
                songName = userCommandQuery;
            } else {
                songName = "The+Sign+by+Ace+of+Base";
            }
            var spotifyClient = new Spotify({
                id: keys.spotify.id,
                secret: keys.spotify.secret
            })
            spotifyClient.search({
                type: 'track',
                query: songName,
                limit: '1'
            }, function (err, data) {
                if (err) {
                    consoleLogAndWriteToFile(err);
                }
                // console.log(data.tracks.items[0]);
                formatAndDisplaySongDetails(data);
            })
            break;
        case 'movie-this':
            if (userCommandQuery) {
                movieName = userCommandQuery;
            } else {
                movieName = "Mr.+Nobody";
            }
            request('http://www.omdbapi.com/?t=' + movieName + '&apikey=' + keys.request.omdbKey, function (error, response, body) {
                if (error) {
                    consoleLogAndWriteToFile('error: ' + error); // Print the error if one occurred
                } 
                if(JSON.parse(body).Response != "False"){
                    formatAndDisplayMovieDetails(JSON.parse(body));
                } else {
                    consoleLogAndWriteToFile("Error Occured : "+JSON.parse(body).Error);
                }
    
            });
            break;
        default:
            consoleLogAndWriteToFile('In Default case : '+userCommand);
            break;
    }
}

function formatAndDisplaySongDetails(data) {
    var artists = "",
        songName = "",
        songLink = "",
        albumName = "";
    if (data.tracks.items[0].artists.length > 1) {
        for (i = 0; i < data.tracks.items[0].artists.length; i++) {
            artists = data.tracks.items[0].artists[i].name + ", " + artists;
        }
    }
    consoleLogAndWriteToFile("Song Name : " + data.tracks.items[0].name);
    consoleLogAndWriteToFile("Artist(s) : " + artists);
    consoleLogAndWriteToFile("Spotify Song Link : " + data.tracks.items[0].album.external_urls.spotify);
    consoleLogAndWriteToFile("Album Name : " + data.tracks.items[0].album.name);
    consoleLogAndWriteToFile('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
}

function formatAndDisplayMovieDetails(data) {
    consoleLogAndWriteToFile("Title of the movie:                   " + data.Title + "\n");
    consoleLogAndWriteToFile("Year the movie came out:              " + data.Year + "\n");
    consoleLogAndWriteToFile("IMDB Rating of the movie:             " + data.Rated + "\n");
    consoleLogAndWriteToFile("Rotten Tomatoes Rating of the movie:  " + getRottenTomatoesRating(data.Ratings) + "\n");
    consoleLogAndWriteToFile("Country where the movie was produced: " + data.Country + "\n");
    consoleLogAndWriteToFile("Language of the movie:                " + data.Launguage + "\n");
    consoleLogAndWriteToFile("Plot of the movie:                    " + data.Plot + "\n");
    consoleLogAndWriteToFile("Actors in the movie:                  " + data.Actors + "\n");
}

function consoleLogAndWriteToFile(data) {
    var currentDateTime = new Date();
    console.log(data);
    data = "\n" + currentDateTime + ": " + data;
    fs.appendFile('./logs.txt', data, (err) => {
        if (err) throw err;
    });
}

function getRottenTomatoesRating(ratings) {
    for (i = 0; i < ratings.length; i++) {
        if (ratings[i].Source === "Rotten Tomatoes") {
            return ratings[i].Value;
        }
    }
}