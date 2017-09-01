/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter')
var W3W_API_KEY = process.env.W3W_API_KEY
var XOXP_API_KEY = process.env.XOXP_API_KEY
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
	/*bot.api.users.info({user: message.user}, function(err, info){
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
	}) */
	
	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			var body = Buffer.concat(chunks);
			//bot.reply(message, body.toString());
			var fulltext = body.toString();
			if (fulltext.indexOf("Invalid") <= 0) {
				var frontCut = fulltext.substring(fulltext.indexOf("-"));
				var lng = frontCut.substring(0, frontCut.indexOf(","));
				var lat = frontCut.substring(frontCut.indexOf(":")+1)
				lat = lat.substring(0, lat.indexOf("}"));
				var optionsAdd = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=true_or_false",
				"headers": {}
				};
				var reqAdd = http.request(optionsAdd, function (res) {
					var chunksAdd = [];

					res.on("data", function (chunkAdd) {
						chunksAdd.push(chunkAdd);
					});

					res.on("end", function () {
						var bodyAdd = Buffer.concat(chunksAdd);
						var returnedAdd = bodyAdd.toString();
						var addressAdd = returnedAdd.substring(returnedAdd.indexOf("formatted_address")+22,returnedAdd.indexOf("geometry")-13);
						
						bot.reply(message, "W3W address: "+message.match+" is located approximately at: *"+addressAdd+"* \nhttp://waze.to/?ll="+lat+","+lng+"&navigate=yes\nhttp://www.google.com/maps/place/"+lat+","+lng);
						//bot.reply(message, 'http://waze.to/?ll='+lat+","+lng+"&navigate=yes");
						//bot.reply(message, 'http://www.google.com/maps/place/'+lat+","+lng);
					});
				});
				reqAdd.end();
				
				
						
			} else 	{
				bot.reply(message, 'Umm...'+message.match+' does not seem to worky... how abouts you try again? Dont fail this time...');
			}
		});
	});
	req.end();
	//bot.reply(message, 'http://w3w.co/'+message.match)      
})

controller.hears(['Tyranitar'], 'ambient', (bot, message) => {
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	var callouts = ["Hey there, are you looking for a Tyranitar? I think i found one!!","Drop what you are doing (unless you're holding a baby? nvm, still drop it)! There is a Tyranitar!","T-t-t-t-tranitarrrrrrr! Yup, a Tyranitar has cracked. Go get em!"];
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
		if (whochannel2 == "raid-battles-botalert"  && whodis2 == "ooglybot"){
			
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("hours")+6,message.text.indexOf("sec")+3);
			var http = require("https");
			var options = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords+"&sensor=true_or_false",
				"headers": {}
			};
			var req = http.request(options, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body = Buffer.concat(chunks);
					var returned = body.toString();
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					var callout = callout+" Trex is located at *"+portal+"* gym and will end in approx:  *"+endTime+"*  The nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					//bot.reply(message, callout);
					bot.say({
						text: callout,
						channel: "raid-battles-callout"
					});
					//bot.reply(message, 'http://waze.to/?ll='+coords+"&navigate=yes");
					//bot.reply(message, 'http://www.google.com/maps/place/'+coords);
				});
			});
		req.end();
			//http://maps.googleapis.com/maps/api/geocode/json?latlng=29.92344,-90.088038&sensor=true_or_false
			//formatted_address" : "
			//coords = coords.substring(coords.indexOf("");
			
		}

	}
	getUserAndChannel(evaluate);

	 
})


controller.hears(['embed: A wild'], 'ambient', (bot, message) => {
	var whodisid3 = 'empty'
	var whodis3 = 'empty'
	var whochannel3 = 'empty'
	//var callouts3 = ["Hey there, are you looking for a Tyranitar? I think i found one!!","Drop what you are doing (unless you're holding a baby? nvm, still drop it)! There is a Tyranitar!","T-t-t-t-tranitarrrrrrr! Yup, a Tyranitar has cracked. Go get em!"];
	//https://slack.com/api/chat.postMessage?token="+XOXP_API_KEY+"&channel=%23gymalert&text=Tester&pretty=1
	function getUserAndChannel3(callback3){
		bot.api.users.info({user: message.user}, function(err, info){
			whodisid3 = message.user;
			whodis3 = info.user.name;
			JSON.stringify(whodis3);    
			
			bot.api.channels.info({channel: message.channel}, function(err, info){
				try {
					whochannel3 = info.channel.name;

				} catch (err) {    
					whochannel3 = "Private channel or DM";

				}
				JSON.stringify(whochannel3);
				callback3()

			})
			   
		})
    
	}
	
	/*[discord/PokeHunt] <HuntrBot>  embed: A wild Dragonair (148) has appeared! - Click above to view in the wild.

*Remaining: 17 min 2 sec* - https://PokeFetch.com/#29.98490373665176,-90.09552313792531*/
	
	function evaluate3 () {
		if (whochannel3 == "Private channel or DM"  && whodis3 == "ooglybot"){
			
			var coords3 = message.text.substring(message.text.indexOf("/#")+2);
			//bot.reply(message, coords3);
			coords3 = coords3.slice(0,-1);
			//bot.reply(message, coords3);
			//var portal3 = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime3 = message.text.substring(message.text.indexOf("Remaining:")+11,message.text.indexOf("sec")+3);
			var poke3 = message.text.substring(message.text.indexOf("embed: A wild")+14,message.text.indexOf("(")-1);
			var http = require("https");
			var options3 = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords3+"&sensor=true_or_false",
				"headers": {}
			};
			var req3 = http.request(options3, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body3 = Buffer.concat(chunks);
					var returned3 = body3.toString();
					var address3 = returned3.substring(returned3.indexOf("formatted_address")+22,returned3.indexOf("geometry")-13);
					//var callout3 = callouts3[Math.floor(Math.random()*callouts3.length)];
					var callout3 = "*"+poke3 + "* has been spotted and will poof in approx:  \n*"+endTime3+"*\nThe nearest street address is:  *"+address3+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords3+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords3;
					//bot.reply(message, callout);
					if (poke3 == "Dratini"){
						bot.say({
						text: callout3,
						channel: "rarepoke-dratini"
					});
					} else if (poke3 == "Machop"){
						bot.say({
						text: callout3,
						channel: "rarepoke-machop"
					});
					} else {
						bot.say({
						text: callout3,
						channel: "rarespawns-nola"
					});
					}
					
					//bot.reply(message, 'http://waze.to/?ll='+coords+"&navigate=yes");
					//bot.reply(message, 'http://www.google.com/maps/place/'+coords);
				});
			});
		req3.end();
			//http://maps.googleapis.com/maps/api/geocode/json?latlng=29.92344,-90.088038&sensor=true_or_false
			//formatted_address" : "
			//coords = coords.substring(coords.indexOf("");
			
		}

	}
	getUserAndChannel3(evaluate3);

	 
})





/*
controller.hears(['embed: A wild'], 'ambient', (bot, message) => {
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	//var callouts = [];
	//https://slack.com/api/chat.postMessage?token="+XOXP_API_KEY+"&channel=%23gymalert&text=Tester&pretty=1
	bot.reply(message, message.match);
	function getUserAndChannel(callback){
		bot.reply(message, message.match);
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
	function evaluatePoke () {
		if (whochannel2 == "testchannelpublic"  && whodis2 == "ooglybooglies"){
			/*[discord/PokeHunt] <HuntrBot>  embed: A wild Dragonair (148) has appeared! - Click above to view in the wild.

*Remaining: 17 min 2 sec* - https://PokeFetch.com/#29.98490373665176,-90.09552313792531* /
			var coords = message.text.substring(message.text.indexOf("/#")+2,37);
			bot.reply(message,coords);
			var pokeFound = message.text.substring(message.text.indexOf("wild ")+5,message.text.indexOf(" ("));
			var endTime = message.text.substring(message.text.indexOf("min")+3,message.text.indexOf("sec")+3);
			var http = require("https");
			var options = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords+"&sensor=true_or_false",
				"headers": {}
			};
			var req = http.request(options, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body = Buffer.concat(chunks);
					var returned = body.toString();
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					var callout = pokeFound + " was found and will despawn in approx:  *"+endTime+"*  The nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					bot.reply(message, callout);
					bot.say({
						text: callout,
						channel: "testchannelpublic2"
					});
					//bot.reply(message, 'http://waze.to/?ll='+coords+"&navigate=yes");
					//bot.reply(message, 'http://www.google.com/maps/place/'+coords);
				});
			});
		req.end();
			//http://maps.googleapis.com/maps/api/geocode/json?latlng=29.92344,-90.088038&sensor=true_or_false
			//formatted_address" : "
			//coords = coords.substring(coords.indexOf("");
			
		}

	}
	getUserAndChannel(evaluatePoke);

	 
})
*/



//
controller.hears(['Articuno','Lugia','Moltres','Zapdos','Mewtwo','Raikou'], 'ambient', (bot, message) => {
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	var callouts = ["Woah, WTF is that? A LEGENDARY!","Um, why are you still in Slack? Open POGO and go get that LEGENDARY!","Get them Golden Raz ready bro! Its time to get yourself a LEGENDARY!"];
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
	function evaluateLeg () {
		if (whochannel2 == "raid-battles-botalert"  && whodis2 == "ooglybot"){
			
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			var http = require("https");
			var options = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords+"&sensor=true_or_false",
				"headers": {}
			};
			var req = http.request(options, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body = Buffer.concat(chunks);
					var returned = body.toString();
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					var callout = ":"+message.match+":  *"+message.match+"* is located at *"+portal+"* gym \nRaid will end in approx:  *"+endTime+"*\nThe nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					//bot.reply(message, callout);
					bot.say({
						text: callout,
						channel: "raid-battles-callout"
					});
					//bot.reply(message, 'http://waze.to/?ll='+coords+"&navigate=yes");
					//bot.reply(message, 'http://www.google.com/maps/place/'+coords);
				});
			});
		req.end();
			//http://maps.googleapis.com/maps/api/geocode/json?latlng=29.92344,-90.088038&sensor=true_or_false
			//formatted_address" : "
			//coords = coords.substring(coords.indexOf("");
			
		}
		
		if (whochannel2 == "raid-battles-wbalert"  && whodis2 == "ooglybot"){
			
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			var http = require("https");
			var options = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords+"&sensor=true_or_false",
				"headers": {}
			};
			var req = http.request(options, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body = Buffer.concat(chunks);
					var returned = body.toString();
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					var callout =":"+message.match+":  *"+message.match+"* is located at *"+portal+"* gym \nRaid will end in approx:  *"+endTime+"*\nThe nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					//bot.reply(message, callout);
					bot.say({
						text: callout,
						channel: "geo-westbank"
					});
					//bot.reply(message, 'http://waze.to/?ll='+coords+"&navigate=yes");
					//bot.reply(message, 'http://www.google.com/maps/place/'+coords);
				});
			});
		req.end();
			//http://maps.googleapis.com/maps/api/geocode/json?latlng=29.92344,-90.088038&sensor=true_or_false
			//formatted_address" : "
			//coords = coords.substring(coords.indexOf("");
			
		}

	}
	getUserAndChannel(evaluateLeg);

	 
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
