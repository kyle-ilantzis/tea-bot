var fs = require('fs');
var Botkit = require('botkit');

function readAllJSON(file) {
  var read = !fs.existsSync(file) ? null : fs.readFileSync(file, {encoding: 'utf8'});
  return read === null ? {} : JSON.parse( read );
}

var config = readAllJSON('config.json');

var controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: config.apiToken
}).startRTM();

controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
  bot.reply(message,'Hello yourself.');
});
