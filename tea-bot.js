var fs = require('fs');
var Botkit = require('botkit');

function readAllJSON(file) {
  var read = !fs.existsSync(file) ? null : fs.readFileSync(file, {encoding: 'utf8'});
  return read === null ? {} : JSON.parse( read );
}

function saveAllJSON(file,json) {
  fs.writeFileSync(file,JSON.stringify(json));
}

var CONFIG_FILE = 'config.json';
var BRAIN_FILE = 'brain.json';
var DM = ['direct_message','direct_mention','mention'];

var TEA_LEFT_CMD = 'l';

var config = readAllJSON(CONFIG_FILE);

var brain = readAllJSON(BRAIN_FILE);

function saveBrain() {
  saveAllJSON( BRAIN_FILE, brain );
}

var controller = Botkit.slackbot({
  debug: false
});

controller.spawn({
  token: config.apiToken
}).startRTM();

controller.hears('\\bclaim\\b', DM, function(bot,message) {
  if (brain.claimer == message.user) {

    bot.reply(message,'You have already claimed me. If you want to give up control tell me "unclaim".');

  } else if (brain.claimer) {

    bot.reply(message,'I aim already claimed by <@' + brain.claimer +'>.');

  } else {

    brain.claimer = message.user
    saveBrain();

    bot.reply(message,'You have claimed me! I will only listen to tea commands from you. If you want to give up control tell me "unclaim".');
  }
});

function preconditions(bot,message) {

  if (!brain.claimer) {
    bot.reply(message,'I need to be claimed before I can be used. If you want to claim me back tell me "claim".');
    return false;
  }

  if (brain.claimer !== message.user) {
    bot.reply(message,'I aim already claimed by <@' + brain.claimer +'>.');
    return false;
  }

  return true;
}

controller.hears('\\bunclaim\\b', DM, function(bot,message) {
  if (!preconditions(bot,message)) {
    return;
  }

  delete brain.claimer;
  saveBrain();

  bot.reply(message,'You have unclaimed me! If you want to claim me back tell me "claim".');
});

controller.hears('\\bon <#(.*)>', DM, function(bot,message) {
  if (!preconditions(bot,message)) {
    return;
  }

  console.log("channel cmd");
  console.log(message);

  var channel = message.match[1];

  brain.channel = channel;
  saveBrain();

  bot.reply(message,'Got it. I\'ll broadcast tea on <#' + channel + '>.');
});

controller.hears('\\b([A-Za-z]) is (.*)', DM, function(bot, message) {
  if (!preconditions(bot,message)) {
    return;
  }

  var alias = message.match[1];
  var flavor = message.match[2];

  var aliases = brain.aliases || {};
  aliases[alias] = flavor;
  brain.aliases = aliases;
  saveBrain();

  if (alias === TEA_LEFT_CMD) {
    bot.reply(message, 'Sorry. The single letter "' + TEA_LEFT_CMD + '" is for saying there is some tea left.');
  } else {
    bot.reply(message, 'Got it. When you say "' + alias + '" i\'ll tell others there is some "' + flavor + '" tea.');
  }
});

controller.hears('\\b([A-Za-z])\\b', DM, function(bot, message) {
  if (!preconditions(bot,message)) {
    return;
  }

  console.log(message);

  var channel = brain.channel;
  if (!channel) {
    bot.reply(message, 'I need to be told what channel to broadcast tea on. Tell me "on #X".');
  }

  var alias = message.match[1];
  var aliases = brain.aliases || {};
  var flavor = aliases[alias];

  if (alias !== TEA_LEFT_CMD && !flavor) {
    bot.reply(message, 'Sorry. I don\'t know what "' + alias + '" is. Tell me "X is Y".');
    return;
  }

  var broadcast = alias === TEA_LEFT_CMD ? "There is some tea left." : 'tea: ' + flavor;

  bot.say({
    text: broadcast,
    channel: channel
  });
});
