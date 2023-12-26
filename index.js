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
const instagramDl = require("@sasmeee/igdl");
const axios = require('axios');
const fs = require('fs');
const ytdl = require('ytdl-core');


const { TiktokDL } = require("@tobyg74/tiktok-api-dl")


let config = require("./config.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});





// Command Usage: !instadel url




client.on('messageCreate', message => {
  // Check if the message author is a bot
  if (message.author.bot) return;

  // Check if the message starts with the desired prefix (e.g., '!')
  if (message.content.startsWith(config.prefix)) {
    // Get the message content without the prefix
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Example commands
    if (command === 'ping') {
      message.reply('Pong!');
    } else if (command === 'hello') {
      message.channel.send('Hello!');
    }

    if (command === config.commandname ) { // Instagram download command
      if(config.onlyONEchannel && config.channelid !== message.channel.id)return message.reply("Only in channel <#"+config.channelid+">").then((m) => {deleteMessage(m)})

      deleteMessage(message);

      let videoUrl = args[0];

      if (!videoUrl) return message.reply("Please specify a video URL...").then((m) => { deleteMessage(m) });

      if (videoUrl.includes("instagram.com/") || videoUrl.includes("instagram.com/")){ // INSTAGRAM URL

        async function getVideo() {
          try {
            const dataList = await instagramDl(videoUrl);
            console.log(dataList[0].download_link);
            return dataList;
          } catch {
            message.reply("Error: Invalid Video URL...").then((m) => { deleteMessage(m) });
            return;
          }
        }
  
        async function sendVideo(fileName) {
          try {
            await message.channel.send({ content: `download by : \`${message.author.username}\``, files: [fileName] });
            message.reply('The video has been successfully sent!').then((m) => { deleteMessage(m) });
          } catch (error) {
            console.error('Error sending the video:', error);
            message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
          }
        }
  
        start();
  
        async function start() {
          let dataList = await getVideo();
          if (!dataList) return;
          let videoURL = dataList[0].download_link;
  
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


      
      } else if(videoUrl.includes('tiktok.com/')){ // TIKTOK URL

       

        TiktokDL(videoUrl, {
          version: "v1" //  version: "v1" | "v2" | "v3"
        }).then((result) => {
          console.log(result.result.video[0]) // video url
        })

        TiktokDL(videoUrl, {
          version: "v1" // version: "v1" | "v2" | "v3"
        }).then((result) => {
          const videoLink = result.result.video[0]; // Récupère le lien de la vidéo
          message.channel.send(`|| ${videoLink} || \ndownload by : \`${message.author.username}\` `); // Envoie le lien dans le chat Discord
        }).catch((error) => {
          console.error('Erreur lors du téléchargement TikTok :', error);
          message.reply('Une erreur est survenue lors du téléchargement de la vidéo TikTok.').then((m) => { deleteMessage(m) })
        });
        


     } else if (videoUrl.includes("youtu.be/") || videoUrl.includes("youtube.com/")){ // YOUTUBE
        async function downloadVideo(url) {
          try {
            // Vérifier la durée de la vidéo
            const info = await ytdl.getInfo(url);
            const duration = parseInt(info.videoDetails.lengthSeconds);
            if (duration > 120) {
              message.reply("La vidéo est plus longue que 2 minutes. Arrêt du téléchargement.").then((m) => { deleteMessage(m) })
              return;
            }
        

            message.channel.send('Début du téléchargement....').then(async (msg) => {

          
                // Téléchargement de la vidéo
                const videoStream = ytdl(url, { filter: 'audioandvideo' });
                let lastUpdate = Date.now();
                const updateInterval = 2000; // Mettre à jour toutes les 5 secondes (5000 millisecondes)
                videoStream.on('progress', (chunkLength, downloaded, total) => {
                  const currentTime = Date.now();
                  if (currentTime - lastUpdate > updateInterval) {
                    const downloadedSize = (downloaded / 1024 / 1024).toFixed(2);
                    const totalSize = (total / 1024 / 1024).toFixed(2);
                    msg.edit(`Téléchargement en cours : ${downloadedSize} MB / ${totalSize} MB`);
                    lastUpdate = currentTime;
                  }
                });
            
                // Vérifier la taille de la vidéo
                const videoSize = await new Promise((resolve, reject) => {
                  videoStream.once('response', (res) => {
                    const size = res.headers['content-length'];
                    resolve(size);
                  });
                });
            
                if (videoSize && videoSize > 25 * 1024 * 1024) {
                  msg.edit('La vidéo est trop volumineuse. Téléchargement d\'une résolution plus faible.');
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
            
            
                // Enregistrer la vidéo
                videoStream.pipe(fs.createWriteStream(fileName));
                videoStream.on('end', async () => {
                  await sendVideo(fileName); // Envoyer la vidéo sur Discord après le téléchargement
                  fs.unlinkSync(fileName); // Supprimer le fichier temporaire après l'envoi
                });
                
                msg.edit('Téléchargement terminé.').then((m) => { deleteMessage(m) })
            })
          } catch (error) {
            msg.edit('Une erreur s\'est produite lors du téléchargement de la vidéo :', error);
          }
        }
        
        // Fonction pour télécharger la vidéo avec une résolution plus faible
        async function downloadVideoWithLowerResolution(url, msg) {
          try {
            const formats = await ytdl.getBasicInfo(url);
            const lowerResFormat = formats.formats.find((format) => format.resolution && format.resolution !== '1080p');
            if (lowerResFormat) {
              await msg.edit('Téléchargement d\'une résolution plus faible...');
              const videoStream = ytdl(url, { format: lowerResFormat });
              videoStream.pipe(fs.createWriteStream('video.mp4'));
              msg.edit('Téléchargement terminé.');
            } else {
              await msg.edit('Aucune résolution inférieure disponible. Impossible de télécharger la vidéo.');
            }
          } catch (error) {
             await msg.edit('Une erreur s\'est produite lors du téléchargement de la vidéo avec une résolution plus faible :', error)
             await deleteMessage(msg, 10000)
          }
        }

        async function sendVideo(fileName) {
          try {
            await message.channel.send({ content: `download by : \`${message.author.username}\``, files: [fileName] });
            message.reply('The video has been successfully sent!').then((m) => { deleteMessage(m) });
          } catch (error) {
            console.error('Error sending the video:', error);
            message.reply('An error occurred while sending the video.').then((m) => { deleteMessage(m) });
          }
        }
        
        // Télécharger la vidéo
        downloadVideo(videoUrl);
      } else {
        message.reply("Please specify a video URL instagram, youtube or tiktok...").then((m) => { deleteMessage(m) })
      }



   
    }
  }
});



function deleteMessage(message, howlong) {

    if(howlong){
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
