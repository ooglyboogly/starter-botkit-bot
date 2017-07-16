/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/

This is a sample Slack bot built with Botkit.

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
var STUDIO_TOKEN = process.env.BOTKIT_STUDIO_TOKEN

var Botkit = require('botkit')
var fs = require('fs')
var path = require('path')
var debug = require('debug')('botkit:main')
var BotkitStorageBeepBoop = require('botkit-storage-beepboop')

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot({
  debug: false,
  studio_token: STUDIO_TOKEN,
  storage: BotkitStorageBeepBoop()
})

controller.startTicking()

// Set up an Express-powered webserver to expose oauth and webhook endpoints
require('./components/webserver/')(controller)

// Register sample "skills"
var normalizedPath = path.join(__dirname, 'skills')
fs.readdirSync(normalizedPath).forEach(file => {
  require(path.join(normalizedPath, file))(controller)
})

// reply to any incoming message
controller.on('message_received', function(bot, message) {
    bot.reply(message, 'I heard... something!');
});