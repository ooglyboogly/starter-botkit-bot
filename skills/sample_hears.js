/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter')
var W3W_API_KEY = process.env.W3W_API_KEY
var W3W_API_KEY = process.env.XOXP_API_KEY
module.exports = controller => {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  var stats = {
    triggers: 0,
    convos: 0
  }

  controller.on('heard_trigger', () => stats.triggers++)

  controller.on('conversationStarted', () => stats.convos++)
/*
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
  })*/
  
controller.hears([/(\w\w\w\w+?\.\w\w\w\w+?\.\w\w\w\w+)/g], 'ambient', (bot, message) => {
	var http = require("https");
	var options = {
		"method": "GET",
		"hostname": "api.what3words.com",
		"port": null,
		"path": "/v2/forward?addr="+message.match+"&key="+W3W_API_KEY+"&lang=en&format=json&display=full&display=terse",
		"headers": {}
	};
	
	//https://slack.com/api/chat.postMessage?token="+XOXP_API_KEY+"&channel=%23gymalert&text=Tester&pretty=1
	bot.api.users.info({user: message.user}, function(err, info){
		var whodisid = message.user;
		var whodis = info.user.name;
               JSON.stringify(whodis);         
	})  
    bot.api.channels.info({channel: message.channel}, function(err, info){
		try {
			whochannel = info.channel.name;
		} catch (err) {    
		var whochannel = "Private channel or DM";
		}
        JSON.stringify(whochannel);
	})
	
	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			var fulltext = body.toString();
			if (fulltext.indexOf("Invalid") <= 0) {
				var frontCut = fulltext.substring(fulltext.indexOf("-"));
				var lng = frontCut.substring(0, frontCut.indexOf(","));
				var lat = frontCut.substring(frontCut.indexOf(":")+1)
				lat = lat.substring(0, lat.indexOf("}"));
				bot.reply(message, 'http://waze.to/?ll='+lat+","+lng+"&navigate=yes");
				bot.reply(message, 'http://www.google.com/maps/place/'+lat+","+lng);		
			} else 	{
				bot.reply(message, 'Umm...'+message.match+' does not seem to worky... how abouts you try again? Dont fail this time...');
			}
		});
	});
	req.end();
	//bot.reply(message, 'http://w3w.co/'+message.match)      
})

controller.hears(['heyOogly'], 'ambient', (bot, message) => {
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	var callouts = ["Hey there, are you looking for a Tyranitar? I think i found one!!","Drop what you are doing (unless you're holding a baby? no still do it)! There is a Tyranitar!","T-t-t-t-tranitarrrrrrr! Yup, a Tyranitar has cracked. Go get em!"];
	//https://slack.com/api/chat.postMessage?token="+XOXP_API_KEY+"&channel=%23gymalert&text=Tester&pretty=1
	function getUserAndChannel(callback){
		bot.api.users.info({user: message.user}, function(err, info){
			whodisid2 = message.user;
			whodis2 = info.user.name;
			JSON.stringify(whodis2);    
			
			bot.api.channels.info({channel: message.channel}, function(err, info){
				try {
					whochannel2 = info.channel.name;

				} catch (err) {    
					whochannel2 = "Private channel or DM";

				}
				JSON.stringify(whochannel2);
				callback()

			})
			   
		})
    
	}
	function evaluate () {
		if (whochannel2 == "testchannelpublic"  && whodis2 == "ooglybooglies"){
			var callout = callouts[Math.floor(Math.random()*callouts.length)];
			bot.reply(message, 'Who is7: '+ whodisid2 + '  Who is it7:  '+whodis2+'  What channel7:  '+whochannel2);
			bot.reply(message, callout);
		}

	}
	getUserAndChannel(evaluate);

	 
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
