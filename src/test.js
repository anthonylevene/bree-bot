const ytdl = require("ytdl-core");

(async () => {
    const songInfo = await ytdl.getInfo("https://www.youtube.com/watch?v=uxugaMpt1vU");
    console.log({
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    });
})();