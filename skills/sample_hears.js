/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

//var wordfilter = require('wordfilter')
//What 3 words API Key
var W3W_API_KEY = process.env.W3W_API_KEY
//Slack API Key
var XOXP_API_KEY = process.env.XOXP_API_KEY

//No idea what the module, triggers, or stats actually do... they were here when i got here...
module.exports = controller => {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  var stats = {
    triggers: 0,
    convos: 0
  }

  controller.on('heard_trigger', () => stats.triggers++)

  controller.on('conversationStarted', () => stats.convos++)
/*This was example code... use it for baseline reference
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
 
//What 3 words module - listens for regex for W3W format 
controller.hears([/(\w\w\w\w+?\.\w\w\w\w+?\.\w\w\w\w+)/g], 'ambient', (bot, message) => {
	
	//HTML get of W3W output to be parsed for Coords
	var http = require("https");
	var options = {
		"method": "GET",
		"hostname": "api.what3words.com",
		"port": null,
		"path": "/v2/forward?addr="+message.match+"&key="+W3W_API_KEY+"&lang=en&format=json&display=full&display=terse",
		"headers": {}
	};
	
	//Parse W3W output	
	var req = http.request(options, function (res) {
		var chunks = [];

		res.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res.on("end", function () {
			//body of HTML get
			var body = Buffer.concat(chunks);
			//make body into String output
			var fulltext = body.toString();
			//If output does not contain "invalid" then continue processing
			if (fulltext.indexOf("Invalid") <= 0) {
				//chop output into relevant pieces based on known common identifiers (subj to change if website output changes)
				var frontCut = fulltext.substring(fulltext.indexOf("-"));
				//get long and lat from remaining text
				var lng = frontCut.substring(0, frontCut.indexOf(","));
				var lat = frontCut.substring(frontCut.indexOf(":")+1)
				lat = lat.substring(0, lat.indexOf("}"));
				//use Google API to get address associated with lat long
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
						//full HTML output for address api is Body
						var bodyAdd = Buffer.concat(chunksAdd);
						var returnedAdd = bodyAdd.toString();
						//pull out address from full response
						var addressAdd = returnedAdd.substring(returnedAdd.indexOf("formatted_address")+22,returnedAdd.indexOf("geometry")-13);
						
						//output back to the user the waze and google links for navigation
						bot.reply(message, "W3W address: "+message.match+" is located approximately at: *"+addressAdd+"* \nhttp://waze.to/?ll="+lat+","+lng+"&navigate=yes\nhttp://www.google.com/maps/place/"+lat+","+lng);
						
					});
				});
				reqAdd.end();
				
				
			//if invalid API response (usually due to something triggering W3W regex that is not actually valid W3W			
			} else 	{
				bot.reply(message, 'Umm...'+message.match+' does not seem to worky... how abouts you try again? Dont fail this time...');
			}
		});
	});
	req.end();
})

//Code for Tyranitar only - probably not needed, but not worth combining with other mons
controller.hears(['Tyranitar'], 'ambient', (bot, message) => {
	//setup variables for user ID and anme as well as channel
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	//array setup for variable intros for fun
	var callouts = ["Hey there, are you looking for a Tyranitar? I think i found one!!","Drop what you are doing (unless you're holding a baby? nvm, still drop it)! There is a Tyranitar!","T-t-t-t-tranitarrrrrrr! Yup, a Tyranitar has cracked. Go get em!"];
	//populate variables with user and channel data
	function getUserAndChannel(callback){
		bot.api.users.info({user: message.user}, function(err, info){
			whodisid2 = message.user;
			whodis2 = info.user.name;
			JSON.stringify(whodis2);    
			
			//find channel name, if private channel or DM then notate that as the channel name
			bot.api.channels.info({channel: message.channel}, function(err, info){
				try {
					whochannel2 = info.channel.name;

				} catch (err) {    
					whochannel2 = "Private channel or DM";

				}
				JSON.stringify(whochannel2);
				//callback function to stop program from running until these crucial variables are populated
				callback()

			})
			   
		})
    
	}
	function evaluate () {
		//check to see if channel is from discord BotAlert and from my Discord Bot (stops from letting users trigger evaluation posts)
		if (whochannel2 == "raid-battles-botalert"  && whodis2 == "ooglybot"){
			//coords, portal name, time raid ends are pulled out of Discord bot message
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("hours")+6,message.text.indexOf("sec")+3);
			//pull street address from google api based on coords of portal
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
					//pull the address out of API results from Google
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					//pick random callout msg from array setup
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					//append legit data to the fun whimsical data for Trex
					var callout = callout+" Trex is located at *"+portal+"* gym and will end in approx:  *"+endTime+"*  The nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					//post the full callout data into the Callout channel
					bot.say({
						text: callout,
						channel: "raid-battles-callout"
					});
				});
			});
		req.end();
			
		}

	}
	getUserAndChannel(evaluate);

	 
})

//Function to detect pokemon spawns from Discord bot - embed: A Wild is trigger word
controller.hears(['embed: A wild'], 'ambient', (bot, message) => {
	var whodisid3 = 'empty'
	var whodis3 = 'empty'
	var whochannel3 = 'empty'
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
	
	function evaluate3 () {
		//rarespawn bot channel is private, so need to make sure private and from ooglybot
		if (whochannel3 == "Private channel or DM"  && whodis3 == "ooglybot"){
			//pull out coords
			var coords3 = message.text.substring(message.text.indexOf("/#")+2);
			coords3 = coords3.slice(0,-1);
			//get end time, pokemon name from text of Bot
			var endTime3 = message.text.substring(message.text.indexOf("Remaining:")+11,message.text.indexOf("sec")+3);
			var poke3 = message.text.substring(message.text.indexOf("embed: A wild")+14,message.text.indexOf("(")-1);
			//get address from google API
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
					//get address from full text
					var address3 = returned3.substring(returned3.indexOf("formatted_address")+22,returned3.indexOf("geometry")-13);
					//configure output of pokemon, raid time, and address
					var callout3 = ":"+poke3+":  *"+poke3 + "* has been spotted and will poof in approx:  \n*"+endTime3+"*\nThe nearest street address is:  *"+address3+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords3+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords3;
					//post dratini spawns to own channel
					if (poke3 == "Dratini"){
						bot.say({
						text: callout3,
						channel: "rarepoke-dratini"
					});
					//post machops to own channel
					} else if (poke3 == "Machop"){
						bot.say({
						text: callout3,
						channel: "rarepoke-machop"
					});
					} else if (poke3 == "Farfetch'd"){
						bot.say({
						text: callout3,
						channel: "rarepoke-Farfetchd"
					});
					//post all others into rarespawn channel Farfetch'd
					} else {
						bot.say({
						text: callout3,
						channel: "rarespawns-nola"
					});
					}
					
				});
			});
		req3.end();
		}
		//westbank spawn channel
		if (whochannel3 == "pokehuntrwb"  && whodis3 == "ooglybot"){
			//pull coords from text
			var coords3 = message.text.substring(message.text.indexOf("/#")+2);
			coords3 = coords3.slice(0,-1);
			//pull endtime, pokemon from text of bot
			var endTime3 = message.text.substring(message.text.indexOf("Remaining:")+11,message.text.indexOf("sec")+3);
			var poke3 = message.text.substring(message.text.indexOf("embed: A wild")+14,message.text.indexOf("(")-1);
			//get address from google api
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
					//create output for user
					var callout3 = ":"+poke3+":  *"+poke3 + "* has been spotted and will poof in approx:  \n*"+endTime3+"*\nThe nearest street address is:  *"+address3+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords3+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords3;
					//post output to westbank channel
					bot.say({
					text: callout3,
					channel: "geo-westbank"
					});
				});
			});
		req3.end();
		}
	}
	getUserAndChannel3(evaluate3);
})


//Legendary detection and post to callout channel
controller.hears(['Articuno','Lugia','Moltres','Zapdos','Mewtwo','Raikou','Suicune ','Entei','Ho-Oh',"Groudon"], 'ambient', (bot, message) => {
	var whodisid2 = 'empty'
	var whodis2 = 'empty'
	var whochannel2 = 'empty'
	//whimsical callout array, currently turned off
	var callouts = ["Woah, WTF is that? A LEGENDARY!","Um, why are you still in Slack? Open POGO and go get that LEGENDARY!","Get them Golden Raz ready bro! Its time to get yourself a LEGENDARY!"];
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
		//confirm botalert channel and from ooglybot user
		if (whochannel2 == "raid-battles-botalert"  && whodis2 == "ooglybot"){
			//pull coords, portal name, and raid endtime from discord bot
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			//get address from google api
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
					//pull address from full api output
					var address = returned.substring(returned.indexOf("formatted_address")+22,returned.indexOf("geometry")-13);
					//random callout from array - currently overwritten
					var callout = callouts[Math.floor(Math.random()*callouts.length)];
					//overwrite callout with output message
					var callout = ":"+message.match+":  *"+message.match+"* is located at *"+portal+"* gym \nRaid will end in approx:  *"+endTime+"*\nThe nearest street address is:  *"+address+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords;
					//put output in the callout channel
					bot.say({
						text: callout,
						channel: "raid-battles-callout"
					});
				});
			});
		req.end();
		}
		//if on westbank channel
		if (whochannel2 == "raid-battles-wbalert"  && whodis2 == "ooglybot"){
			//pull coords, portal name and raid endtime from message from discord bot
			var coords = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			//get address from google api
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
					bot.say({
						text: callout,
						channel: "geo-westbank"
					});
				});
			});
		req.end();
		}
	}
	getUserAndChannel(evaluateLeg);
})


//Sponsored Gyms
controller.hears(['GymHuntrBot'], 'ambient', (bot, message) => {
	var whodisid4 = 'empty'
	var whodis4 = 'empty'
	var whochannel4 = 'empty'
	var callouts4 = ["Woah, WTF is that? A LEGENDARY!","Um, why are you still in Slack? Open POGO and go get that LEGENDARY!","Get them Golden Raz ready bro! Its time to get yourself a LEGENDARY!"];
	function getUserAndChannel4(callback4){
		bot.api.users.info({user: message.user}, function(err, info){
			whodisid4 = message.user;
			whodis4 = info.user.name;
			JSON.stringify(whodis4);    
			
			bot.api.channels.info({channel: message.channel}, function(err, info){
				try {
					whochannel4 = info.channel.name;

				} catch (err) {    
					whochannel4 = "Private channel or DM";

				}
				JSON.stringify(whochannel4);
				callback4()

			})
			   
		})
    
	}
	function evaluateLeg4 () {
		if (whochannel4 == "raid-battles-botalert"  && whodis4 == "ooglybot"){
			
			var coords4 = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal4 = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var raidMon4 = message.text.substring(message.text.indexOf("embed: ")+7,message.text.indexOf("Raid")+4);
			var endTime4 = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			var http = require("https");
			var options4 = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords4+"&sensor=true_or_false",
				"headers": {}
			};
			var req4 = http.request(options4, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body4 = Buffer.concat(chunks);
					var returned4 = body4.toString();
					var address4 = returned4.substring(returned4.indexOf("formatted_address")+22,returned4.indexOf("geometry")-13);
					var callout4 = "Sponsored Raid is located at *"+portal4+"* gym \n*"+raidMon4+"*  Raid will end in approx:  *"+endTime4+"*\nThe nearest street address is:  *"+address4+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords4+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords4;
					if (coords4 == "30.00526,-90.17554" || coords4 == "30.00415,-90.10547" || coords4 == "29.953703,-90.069243" || coords4 == "29.94976,-90.06984" || coords4 == "29.89542,-90.06016" || coords4 == "29.964210,-90.186220") {
						bot.say({
						text: callout4,
						channel: "raid-battles-spons"
						});
					}
					//bot.reply(message, 'test');
				});
			});
		req4.end();
		}
		
		 if (whochannel4 == "raid-battles-wbalert"  && whodis4 == "ooglybot"){
			
			var coords4 = message.text.substring(message.text.indexOf("/#")+2,message.text.indexOf(">"));
			var portal4 = message.text.substring(message.text.indexOf("**")+2,message.text.indexOf(".**"));
			var endTime4 = message.text.substring(message.text.indexOf("Ending:")+8,message.text.indexOf("sec")+3);
			var http = require("https");
			var options4 = {
				"method": "GET",
				"hostname": "maps.googleapis.com",
				"port": null,
				"path": "/maps/api/geocode/json?latlng="+coords4+"&sensor=true_or_false",
				"headers": {}
			};
			var req4 = http.request(options4, function (res) {
				var chunks = [];

				res.on("data", function (chunk) {
					chunks.push(chunk);
				});

				res.on("end", function () {
					var body4 = Buffer.concat(chunks);
					var returned4 = body4.toString();
					var address4 = returned4.substring(returned4.indexOf("formatted_address")+22,returned4.indexOf("geometry")-13);
					var callout4 ="Sponsored Raid is located at *"+portal4+"* gym \nRaid will end in approx:  *"+endTime4+"*\nThe nearest street address is:  *"+address4+"*  \nYou can Waze to it using: "+'http://waze.to/?ll='+coords4+"&navigate=yes"+"  \nor Google Maps:  "+'http://www.google.com/maps/place/'+coords4;
					if (coords4 == "30.00526,-90.17554" || coords4 == "30.00415,-90.10547" || coords4 == "29.95370,-90.06924" || coords4 == "29.94976,-90.06984" || coords4 == "29.89542,-90.06016" || coords4 == "29.964210,-90.186220") {
						bot.say({
						text: callout4,
						channel: "raid-battles-spons"
						});						
					}
				});
			});
		req4.end();
		} 
	}
	getUserAndChannel4(evaluateLeg4);
})
//No idea what this uptime crap does, but dont want to delete it yet....
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
