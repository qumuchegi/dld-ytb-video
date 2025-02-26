import fs from "fs";
import path, { dirname } from "path";
// import ytdl from "ytdl-core";
import chalk from "chalk";
import progress from "progress-stream";
import singleLineLog from "single-line-log";
import { fileURLToPath } from "url";
import { YtdlCore, toPipeableStream } from "@ybd-project/ytdl-core";

const ytdl = new YtdlCore({
  // The options specified here will be the default values when functions such as getFullInfo are executed.
});

const slog = singleLineLog.stdout;
// 待下载的 YouTube 视频链接
const urls = [
  //'https://www.youtube.com/watch?v=G9nqB8BwGHU'
  // 'https://www.youtube.com/watch?v=byFx_76GADo',
  "https://www.youtube.com/watch?v=DZdUS9cDovQ",
  // "https://www.youtube.com/watch?v=mphHFk5IXsQ",
  // "https://www.youtube.com/watch?v=7m8nON7zf0U",
  // "https://www.youtube.com/watch?v=V8myIkor52g",
];
const cookie =
  "HSID=AEOaKZuKnM_tGxzvy; SSID=AHcLOsqG4MjA-4YU0; APISID=978rrE-ypNmOMyPB/AiA_oll6W1EIXb7-f; SAPISID=1RoSshGx8f0GSwUY/Af4512bDGZ7n0YP4R; __Secure-1PAPISID=1RoSshGx8f0GSwUY/Af4512bDGZ7n0YP4R; __Secure-3PAPISID=1RoSshGx8f0GSwUY/Af4512bDGZ7n0YP4R; LOGIN_INFO=AFmmF2swRgIhAI0oC-kgfD-aTl8mvoYtzHdFxh1Zx7hYjReEeu1DXPnsAiEAwdxLonaNuVvJIoZMryZRXfRpKm97fOWzjK_hoUW6px8:QUQ3MjNmeVdWbE1RZ1c1WU5INXBqTEhXVUhUdlEtVkRURzRTQmZBNGQtZkY2aXM3Tm5OYXpYaHJ5c25vc2ZHaDdITDhJNE53OTNzTG95Y0ZZc0tqUnZYampqT05Wd3J3RGtTZnFOXzlkemIxZC15bFM0YjdIa0ZZRHN5d0NNdDZEUWJPS2FVdGZKNW1nMi1fWlhGcnlsOUdxUjZtYi1maW93; __Secure-YEC=Cgt0bG9xYnpTTHZJTSi56J68BjIiCgJSTxIcEhgSFhMLFBUWFwwYGRobHB0eHw4PIBAREiEgLw%3D%3D; PREF=f4=4000000&tz=Asia.Shanghai&f5=30000&f7=100; VISITOR_INFO1_LIVE=kpO6APMkExk; VISITOR_PRIVACY_METADATA=CgJDThIEGgAgDg%3D%3D; YSC=f616r4r8u8o; SID=g.a000uAjws0hpG8FWAtaHCIphNehWXkIFY7j46wYJ-SojAl95xP_xsXamtUt0j2Gz4icZNpSvpgACgYKASwSARcSFQHGX2MimLGRAuTlkCxrP25tDTPU3BoVAUF8yKr415Z8SM98Z1ilB3fPuzvM0076; __Secure-1PSID=g.a000uAjws0hpG8FWAtaHCIphNehWXkIFY7j46wYJ-SojAl95xP_xWbhljtvh3obD7mRVBcLVpAACgYKAaoSARcSFQHGX2MiSOXBlo-Oi0TSrkNTJc7HCRoVAUF8yKrK3Db7-4tdQznpjr0a7vi-0076; __Secure-3PSID=g.a000uAjws0hpG8FWAtaHCIphNehWXkIFY7j46wYJ-SojAl95xP_xJMIPN_Qyn34y_29rtU2FFgACgYKAc0SARcSFQHGX2MiWn-42naH2qclciFWgy9N3BoVAUF8yKrIEJXHIspiGHCMQwMDqAU80076; __Secure-ROLLOUT_TOKEN=CPPVl9eGxsawNxDA_cvc5veKAxjGsP3gseCLAw%3D%3D; __Secure-1PSIDTS=sidts-CjEBEJ3XVw67TE3x9OMb2hA7woumuYCk2iwSbv7O9kca8iZWtbzH7oBP1B69Ms791U5nEAA; __Secure-3PSIDTS=sidts-CjEBEJ3XVw67TE3x9OMb2hA7woumuYCk2iwSbv7O9kca8iZWtbzH7oBP1B69Ms791U5nEAA; GOOGLE_ABUSE_EXEMPTION=ID=5dd3c2130890f7e0:TM=1740578147:C=r:IP=212.8.252.162-:S=yoXD6yDwdc8nduSdJowAieY; ST-xuwub9=session_logininfo=AFmmF2swRgIhAI0oC-kgfD-aTl8mvoYtzHdFxh1Zx7hYjReEeu1DXPnsAiEAwdxLonaNuVvJIoZMryZRXfRpKm97fOWzjK_hoUW6px8%3AQUQ3MjNmeVdWbE1RZ1c1WU5INXBqTEhXVUhUdlEtVkRURzRTQmZBNGQtZkY2aXM3Tm5OYXpYaHJ5c25vc2ZHaDdITDhJNE53OTNzTG95Y0ZZc0tqUnZYampqT05Wd3J3RGtTZnFOXzlkemIxZC15bFM0YjdIa0ZZRHN5d0NNdDZEUWJPS2FVdGZKNW1nMi1fWlhGcnlsOUdxUjZtYi1maW93; SIDCC=AKEyXzWSrr5MwMpZThalIPI9w2XFyJQ7SNpjzr5R5qku_xX1ovYZra4bfRs4acJZHMuOHxFXjsg; __Secure-1PSIDCC=AKEyXzXxhREW2RSmocDdczM9tri2bz8Ptir6VCBVQM8vVEoZrnNiVkE7fIpqQx0-LqLz1vEy7g; __Secure-3PSIDCC=AKEyXzU45IWRVLaor2vk4RImDZiqbiweO7tHwZCQLpu3ssjnxAl5aUmNQcDkXS7iexZr9pbYRmY";

const __dirname = dirname(fileURLToPath(import.meta.url));

const log = console.log;

if (!fs.existsSync(path.resolve(__dirname, "./videos/"))) {
  fs.mkdirSync(path.resolve(__dirname, "./videos/"));
}

(async function () {
  let totalSpent = 0;
  const totalCpentTimer = setInterval(() => totalSpent++, 1000);
  for (const idx in urls) {
    const u = urls[idx];
    await new Promise(async (res) => {
      let dldTimer;
      try {
        let count = 0;
        const timer = setInterval(() => {
          slog(
            `正在获取第${Number(idx) + 1}个 YouTube 视频信息...`,
            `${count++}s`
          );
        }, 1000);
        const info = await ytdl.getBasicInfo(u);
        clearInterval(timer);
        // console.log({ info });
        const { author, description, ownerProfileUrl, video_url, publishDate } =
          info.videoDetails;
        fs.mkdirSync(
          path.resolve(__dirname, `./videos/${info.videoDetails.title}/`)
        );
        fs.writeFileSync(
          path.resolve(
            __dirname,
            `./videos/${info.videoDetails.title}/desc.json`
          ),
          JSON.stringify(
            {
              标题: info.videoDetails.title,
              作者: author,
              描述: description,
              主页: ownerProfileUrl,
              链接: video_url,
              发布时间: publishDate,
            },
            undefined,
            2
          )
        );
        const format = info.formats.find(
          (format) => (format.qualityLabel = "hd720")
        );
        // fs.writeFileSync(
        //   `./formats-${info.videoDetails.title}.json`,
        //   JSON.stringify(info.formats, undefined, 2)
        // );
        // console.log({ format });
        // 视频总大小
        const totalSize = format.contentLength;
        // 创建进度流
        // console.log({totalSize})
        const progressStream = progress({
          length: parseInt(totalSize, 10),
          time: 1000, // 每秒更新一次进度
        });
        const dldFilename = info.videoDetails.title + ".mp4";

        let dldcount = 0;
        dldTimer = setInterval(() => dldcount++, 1000);
        progressStream.on("progress", (progress) => {
          const doneBarLength = parseInt(progress.percentage / 5, 10);
          const totalBarLength = 20;
          let title = info.videoDetails.title;
          if (title.length > 20) {
            title = title.slice(0, 20) + "...";
          }
          slog(
            chalk.yellow(`正在下载第${Number(idx) + 1}个视频`),
            chalk.redBright(title),
            chalk.blue(`分辨率:${format.qualityLabel}`),
            chalk.gray(` ${dldcount}s `),
            chalk.greenBright(`${progress.percentage.toFixed(2)}%`),
            `${new Array(doneBarLength)
              .fill(chalk.green("█"))
              .join("")}${new Array(totalBarLength - doneBarLength)
              .fill("░")
              .join("")}`
          );
        });
        ytdl.download(u, { format }).then((stream) => {
          toPipeableStream(stream)
            .pipe(progressStream)
            .pipe(
              fs.createWriteStream(
                path.resolve(
                  __dirname,
                  `./videos/${info.videoDetails.title}/` + dldFilename
                )
              )
            )
            .on("finish", () => {
              log(
                chalk.green(`\n视频下载完成✅`),
                chalk.redBright(`${info.videoDetails.title}`)
              );
              clearInterval(dldTimer);
              res(undefined);
            })
            .on("error", (err) => {
              log(chalk.red("视频下载出错", err.message));
              clearInterval(dldTimer);
              res(undefined);
            });
        });
      } catch (err) {
        clearInterval(dldTimer);
        res(undefined);
        console.error(err);
      }
    });
  }
  log(chalk.green("视频全部下载完成", `耗时 ${totalSpent}s`));
  clearInterval(totalCpentTimer);
})();
