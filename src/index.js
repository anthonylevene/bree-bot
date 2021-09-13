const Discord = require("discord.js");
const math = require("mathjs");
const {
    discord_token,
    prefix,
} = require("./config.json");
const ytdl = require("ytdl-core");
const { createConnection } = require("net");
const { moveMessagePortToContext } = require("worker_threads");
const bot = new Discord.Client();

const queue = new Map();

const play = async (guild, song, channel) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("start", () => {
            channel.send(`Now playing \`${song.title}\`.`);
        })
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], channel);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
};

bot.on("message", async msg => {
    try {
        if (msg.author.bot) return;
        if (msg.content.startsWith(prefix)) {
            const cmd = msg.content.slice(1).split(" ")[0];
            const args = msg.content.slice(1).split(" ").slice(1);

            const serverQueue = queue.get(msg.guild.id);

            switch (cmd.toLowerCase()) {
                case "play":
                case "p":
                    if (!isUrl(args[0]) || !args[0].toLowerCase().includes("youtu")) return msg.channel.send("That is not a valid YouTube link.");
                    try {
                        const voiceChannel = msg.member.voice.channel;
                        if (!voiceChannel) return msg.channel.send("Go ahead. Join a voice channel.");
                        const permissions = voiceChannel.permissionsFor(msg.client.user);
                        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return msg.channel.send("I need permissions.");

                        const songInfo = await ytdl.getInfo(args[0]);
                        const song = {
                            title: songInfo.videoDetails.title,
                            url: songInfo.videoDetails.video_url,
                        };

                        if (!serverQueue) {
                            msg.channel.send("https://media.discordapp.net/attachments/862341709895303199/877615493459087420/ezgif-6-d974deadaf3b.gif?width=450&height=254");
                            const queueContract = {
                                textChannel: msg.channel,
                                voiceChannel: voiceChannel,
                                connection: null,
                                songs: [],
                                volume: 5,
                                playing: true,
                            }
                            queue.set(msg.guild.id, queueContract);
                            queueContract.songs.push(song);
                            try {
                                let connection = await voiceChannel.join();
                                queueContract.connection = connection;

                                play(msg.guild, queueContract.songs[0], msg.channel);
                            } catch (e) {
                                console.log(e);
                                queue.delete(msg.guild.id);
                                return msg.channel.send(e);
                            }
                        } else {
                            serverQueue.songs.push(song);
                            return msg.channel.send(`\`${song.title}\` has been added to the queue.`);
                        }
                    } catch (e) {
                        return msg.channel.send("An unkown error occurred. Go ahead, take the error message.\n```js" + e + "```");
                    }
                    break;
                case "skip":
                    if (!msg.member.voice.channel) return msg.channel.send(
                        "You must be in a voice channel to skip the song. Cry about it."
                    );
                    if (!serverQueue) return msg.channel.send(
                        "There is no song to skip. Cry about it."
                    );
                    serverQueue.connection.dispatcher.end();
                    break;
                case "stop":
                    if (!msg.member.voice.channel) return msg.channel.send(
                        "You must be in a voice channel to stop the music. Cry about it."
                    );
                    serverQueue.songs = [];
                    serverQueue.connection.dispatcher.end();
                    msg.channel.send("https://c.tenor.com/X13wwMFZN2YAAAAM/dies-cat.gif");
                    break;
                case "queue":
                case "q":
                    if (!serverQueue) return msg.channel.send("There is nothing in the queue. You've lost.");
                    let dat = "```\n> ";
                    serverQueue.songs.forEach(i => dat += `  ${i.title}\n`);
                    dat += "\n```";
                    msg.channel.send(dat);
                    break;
                case "math":
                    try {
                        let answer = math.evaluate(args.join(" "));
                        msg.channel.send(`The answer is ${answer}.`);
                    } catch (e) {
                        msg.channel.send(`There is no answer. Cry about it.\n\`\`\`js\n${e}\`\`\``);
                    }
                    break;
                case "guild-id":
                    msg.channel.send(msg.guild.id);
                    break;
		case "say":
		    if (["my name" "my name."].includes(args.join(" ").toLowerCase())) {
		    msg.channel.send("**"+msg.author.username+".**");
		    }
		    break;
                case "omnipotheon":
                    msg.channel.send("https://cdn.discordapp.com/attachments/886750041874763818/887089742590668831/image0.png");
                    break;
                case "bree":
                    msg.channel.send("https://cdn.discordapp.com/attachments/824641029554700328/887094398851104788/20210831_204856.jpg");
                    break;
                case "its":
                case "it's":
                case "it":
                    if (["time"].includes(args[0].toLowerCase()) || (args[1].toLowerCase() == "time" && args[0].toLowerCase() == "is")) {
                        try {
                            const voiceChannel = msg.member.voice.channel;
                            if (!voiceChannel) return msg.channel.send("Go ahead. Join a voice channel.");
                            const permissions = voiceChannel.permissionsFor(msg.client.user);
                            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return msg.channel.send("I need permissions.");

                            const songInfo = await ytdl.getInfo("https://youtu.be/T12ygsp9Mvg");
                            const song = {
                                title: songInfo.videoDetails.title,
                                url: songInfo.videoDetails.video_url,
                            };

                            if (!serverQueue) {
                                msg.channel.send("https://media.discordapp.net/attachments/862341709895303199/877615493459087420/ezgif-6-d974deadaf3b.gif?width=450&height=254");
                                const queueContract = {
                                    textChannel: msg.channel,
                                    voiceChannel: voiceChannel,
                                    connection: null,
                                    songs: [],
                                    volume: 5,
                                    playing: true,
                                }
                                queue.set(msg.guild.id, queueContract);
                                queueContract.songs.push(song);
                                try {
                                    let connection = await voiceChannel.join();
                                    queueContract.connection = connection;

                                    play(msg.guild, queueContract.songs[0], msg.channel);
                                } catch (e) {
                                    console.log(e);
                                    queue.delete(msg.guild.id);
                                    return msg.channel.send(e);
                                }
                            } else {
                                serverQueue.songs.push(song);
                                return msg.channel.send(`\`${song.title}\` has been added to the queue.`);
                            }
                        } catch (e) {
                            return msg.channel.send("An unkown error occurred. Go ahead, take the error message.\n```js" + e + "```");
                        }
                    }
                    break;
                case "help":
                    msg.channel.send(`
Stop trolling.
\`\`\`yaml
${prefix}help        - Shows the help menu.
${prefix}play <link> - Plays a song.
${prefix}skip        - Skips the current song.
${prefix}stop        - Stop playing music.
${prefix}math <math> - Evaluate a simple math problem.
\`\`\``);
                    break;
                default:
                    return msg.channel.send("Cry about it.");
                    break;
            }
        }
    } catch (e) {
        return msg.channel.send("An unkown error occurred. Go ahead, take the error message.\n```js" + e + "```");
    }
});

bot.once('ready', () => {
    console.log('Connected');
});
bot.once('reconnecting', () => {
    console.log('Reconnecting');
});
bot.once('disconnect', () => {
    console.log('Disconnected');
});

const isUrl = (url) => url.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/) !== null;

bot.login(discord_token);