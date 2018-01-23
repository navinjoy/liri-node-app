var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: 'Fv4JEpJ8y9SkDKAJOlD80iYQt',
  consumer_secret: 'W0VeEk4tUGzS6O0hHynkk6n6HZJgkhUeTloGuKSBB2hgiRAVqO',
  access_token_key: '953126569014304768-BO0lT5JU9C1hEcmjzg52rxMwhB3rGzk',
  access_token_secret: 'WFiqP3ZX6wU0Ccl5tR0xF4EVGaHwE2mdvw4Feerldf66Y'
});
 
var params = {screen_name: 'ucb_nav'};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets[1]);
  }
});