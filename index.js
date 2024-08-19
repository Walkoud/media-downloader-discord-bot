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
const instagramGetUrl = require("instagram-url-direct")
const axios = require('axios');
const fs = require('fs');
const ytdl = require("@distube/ytdl-core");


//const { TiktokDownloader } = require("@tobyg74/tiktok-api-dl")


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
  } else if (command === 'hello') {
    message.channel.send('Hello!');
  }

  if (command === config.commandname) {
    if (config.onlyONEchannel && config.channelid !== message.channel.id) return message.reply("Only in channel <#" + config.channelid + ">").then((m) => { deleteMessage(m) })

    deleteMessage(message);

    let videoUrl = args[0];

    if (!videoUrl) return message.reply("Please specify a video URL...").then((m) => { deleteMessage(m) });

    if (videoUrl.includes("instagram.com/") || videoUrl.includes("instagram.com/")) {
      async function getVideo() {
        try {
          let dataList = await instagramGetUrl(videoUrl);
          console.log(dataList['url_list'][0]);
          return dataList;
        } catch {
          message.reply("Error: Invalid Video URL...").then((m) => { deleteMessage(m) });
          return;
        }
      }

      async function sendVideo(fileName) {
        try {
          await message.channel.send({ content: `Downloaded by: \`${message.author.username}\``, files: [fileName] });
          
        } catch (error) {
          console.error('Error sending the video:', error);
          message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
        }
      }

      start();

      async function start() {
        let dataList = await getVideo();
        if (!dataList) return;
        let videoURL = dataList['url_list'][0];

        try {
          const response = await axios.get(videoURL, { responseType: 'stream' });
          let count = 1;
          let fileName = 'temp_video.mp4';

          while (fs.existsSync(fileName)) {
            fileName = `temp_video_${count}.mp4`;
            count++;
          }

          const writer = fs.createWriteStream(fileName);
          response.data.pipe(writer);

          writer.on('finish', async () => {
            await sendVideo(fileName);
            fs.unlinkSync(fileName);
          });
        } catch (error) {
          console.error('Error downloading or sending the video:', error);
          message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
        }
      }

    } else if (videoUrl.includes('tiktok.com/')) {
/*       TiktokDownloader(videoUrl, {
        version: "v1" //  version: "v1" | "v2" | "v3"
      }).then((result) => {
        console.log(result)
        console.log(result.result.video[0]) // video url
      })

      TiktokDownloader(videoUrl, {
        version: "v1" // version: "v1" | "v2" | "v3"
      }).then((result) => {
        const videoLink = result.result.video[0];
        message.channel.send(`|| ${videoLink} || \nDownloaded by: \`${message.author.username}\` `);
      }).catch((error) => {
        console.error('Error downloading TikTok video:', error);
        message.reply('An error occurred while downloading the TikTok video.').then((m) => { deleteMessage(m) })
      });
 */
      message.reply('TikTok not currently supported.').then((m) => { deleteMessage(m) })

    } else if (videoUrl.includes("youtu.be/") || videoUrl.includes("youtube.com/")) {
      async function downloadVideo(url) {
        try {
          const info = await ytdl.getInfo(url);
          const duration = parseInt(info.videoDetails.lengthSeconds);
          if (duration > 120) {
            message.reply("The video is longer than 2 minutes. Stopping the download.").then((m) => { deleteMessage(m) })
            return;
          }

          message.channel.send('Downloading started...').then(async (msg) => {
            const videoStream = ytdl(url, { filter: 'audioandvideo' });
            let lastUpdate = Date.now();
            const updateInterval = 2000; // Update every 2 seconds
            videoStream.on('progress', (chunkLength, downloaded, total) => {
              const currentTime = Date.now();
              if (currentTime - lastUpdate > updateInterval) {
                const downloadedSize = (downloaded / 1024 / 1024).toFixed(2);
                const totalSize = (total / 1024 / 1024).toFixed(2);
                msg.edit(`Downloading: ${downloadedSize} MB / ${totalSize} MB`);
                lastUpdate = currentTime;
              }
            });

            const videoSize = await new Promise((resolve, reject) => {
              videoStream.once('response', (res) => {
                const size = res.headers['content-length'];
                resolve(size);
              });
            });

            if (videoSize && videoSize > 25 * 1024 * 1024) {
              msg.edit('The video is too large. Downloading a lower resolution.');
              videoStream.destroy();
              await downloadVideoWithLowerResolution(url, msg);
              return;
            }

            let count = 1;
            let fileName = 'temp_video.mp4';

            while (fs.existsSync(fileName)) {
              fileName = `temp_video_${count}.mp4`;
              count++;
            }

            videoStream.pipe(fs.createWriteStream(fileName));
            videoStream.on('end', async () => {
              await deleteMessage(msg);
              await sendVideo(fileName);
              fs.unlinkSync(fileName);
            });

           
          })
        } catch (error) {
          message.reply('An error occurred while downloading the video:', error).then((m) => { deleteMessage(m); });
        }
      }

      async function sendVideo(fileName) {
        try {
          await message.channel.send({ content: `Downloaded by: \`${message.author.username}\``, files: [fileName] });
         
        } catch (error) {
          console.error('Error sending the video:', error);
          message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m); });
        }
      }
      

      async function downloadVideoWithLowerResolution(url, msg) {
        try {
          const formats = await ytdl.getBasicInfo(url);
          const lowerResFormat = formats.formats.find((format) => format.resolution && format.resolution !== '1080p');
          if (lowerResFormat) {
            await msg.edit('Downloading a lower resolution...');
            const videoStream = ytdl(url, { format: lowerResFormat });
            videoStream.pipe(fs.createWriteStream('video.mp4'));
            msg.edit('Download completed.');
          } else {
            await msg.edit('No lower resolution available. Unable to download the video.');
          }
        } catch (error) {
          await msg.edit('An error occurred while downloading the video with a lower resolution:', error)
          await deleteMessage(msg, 10000)
        }
      }

      downloadVideo(videoUrl);
    } else {
      message.reply("Please specify a video URL from Instagram, YouTube, or TikTok...").then((m) => { deleteMessage(m) })
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
