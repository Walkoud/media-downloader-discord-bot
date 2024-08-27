/*
██╗    ██╗ █████╗ ██╗     ██╗  ██╗ ██████╗ ██╗   ██╗██████╗       ██╗██████╗ 
██║    ██║██╔══██╗██║     ██║ ██╔╝██╔═══██╗██║   ██║██╔══██╗     ██╔╝╚════██╗
██║ █╗ ██║███████║██║     █████╔╝ ██║   ██║██║   ██║██║  ██║    ██╔╝  █████╔╝
██║███╗██║██╔══██║██║     ██╔═██╗ ██║   ██║██║   ██║██║  ██║    ╚██╗  ╚═══██╗
╚███╔███╔╝██║  ██║███████╗██║  ██╗╚██████╔╝╚██████╔╝██████╔╝     ╚██╗██████╔╝
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝       ╚═╝╚═════╝ 
                                                                             

 github.com/walkoud

 please leave a star <3
                                                    
*/

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const axios = require('axios');
const fs = require('fs');

const MediaDownloader = require('media-downloader-ez');



let config = require("./config.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.reply('Pong!');
  }

  if (command === config.commandname) {  // <============= HERE DOWNLOAD COMMAND
    if (config.onlyONEchannel && config.channelid !== message.channel.id) return message.reply("Only in channel <#" + config.channelid + ">").then((m) => { deleteMessage(m) })

    deleteMessage(message);

    let videoUrl = args[0];

    if (!videoUrl) return message.reply("Please specify a video URL...").then((m) => { deleteMessage(m) });

    if(MediaDownloader.isVideoLink(videoUrl)){

      message.channel.send('downloading...').then(async (m) => {

        try {
          let attachment
          if(message.content.includes("crop")){
            attachment = await MediaDownloader(videoUrl, {autocrop: true});
          } else {
            attachment = await MediaDownloader(videoUrl, {autocrop: config.autoCropVideos});
          }
          message.channel.send({ content: `Downloaded by: \`${message.author.username}\``, files: [attachment] })
          deleteMessage(m, 0)
        } catch (error) {
          console.log(error)
          m.edit("Error downloading")
          deleteMessage(m, 3000)
        }
      
        })
    }
    else {
      message.reply("Please specify a video URL from Instagram, YouTube, X, tiktok, facebook...").then((m) => { deleteMessage(m) })
    }
  }
});

function deleteMessage(message, howlong) {
  if (howlong) {
    setTimeout(() => {
      message.delete();
    }, howlong);
  } else {
    setTimeout(() => {
      message.delete();
    }, 3000);
  }
}

client.login(config.token);
