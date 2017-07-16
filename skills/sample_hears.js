/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter')

module.exports = controller => {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  var stats = {
    triggers: 0,
    convos: 0
  }

  controller.on('heard_trigger', () => stats.triggers++)

  controller.on('conversationStarted', () => stats.convos++)

  controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', (bot, message) => {
    bot.createConversation(message, (err, convo) => {
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()))
        convo.setVar('convos', stats.convos)
        convo.setVar('triggers', stats.triggers)

        convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.')
        convo.activate()
      }
    })
  })

  controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', (bot, message) => {
    if (message.match[1]) {
      if (!wordfilter.blacklisted(message.match[1])) {
        bot.reply(message, message.match[1])
      } else {
        bot.reply(message, '_sigh_')
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.')
    }
  })
  
  controller.hears([/(\w\w\w\w+?\.\w\w\w\w+?\.\w\w\w\w+)/g], 'ambient', (bot, message) => {
	  var http = require("https");

var options = {
  "method": "GET",
  "hostname": "api.what3words.com",
  "port": null,
  "path": "/v2/forward?addr="+message.match+"&key=D99WCQGN&lang=en&format=json&display=full&display=terse",
  "headers": {}
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
	var fulltext = body.toString();
	var frontCut = fulltext.substring(fulltext.indexOf("-"));
  var lng = frontCut.substring(0, frontCut.indexOf(","));
  var lat = frontCut.substring(frontCut.indexOf(":")+1)
  lat = lat.substring(0, lat.indexOf("}"));
    bot.reply(message, 'http://waze.to/?ll='+lat+","+lng);
  });
});

req.end();
	  
		bot.reply(message, 'http://w3w.co/'+message.match)      
  })

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* Utility function to format uptime */
  function formatUptime (uptime) {
    var unit = 'second'
    if (uptime > 60) {
      uptime = uptime / 60
      unit = 'minute'
    }
    if (uptime > 60) {
      uptime = uptime / 60
      unit = 'hour'
    }
    if (uptime !== 1) {
      unit = unit + 's'
    }

    uptime = parseInt(uptime) + ' ' + unit
    return uptime
  }
}
