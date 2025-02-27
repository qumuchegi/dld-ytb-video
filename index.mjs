import fs from "fs";
import path, { dirname } from "path";
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
const poToken =
  "MlO_wASGm2L3EL_8Bi0ODWURgiXTwNkLD-OQHgYwkUgHJnU95RjBc7Iv3-_ZUAZTdRtIU3Iud2dorLVLV9zoFDbVQwAAKy52EWDqAZTA_sLEDzJvGw==";
const visitorData =
  "CgswakZrclVDLU84YyiWzPy9BjIiCgJOTBIcEhgSFhMLFBUWFwwYGRobHB0eHw4PIBAREiEgbQ%3D%3D";

const __dirname = dirname(fileURLToPath(import.meta.url));

const log = console.log;

if (!fs.existsSync(path.resolve(__dirname, "./videos/"))) {
  fs.mkdirSync(path.resolve(__dirname, "./videos/"));
}

(async function () {
  let totalSpent = 0;
  const totalCpentTimer = setInterval(() => totalSpent++, 1000);
  let failDldVideos = [];
  for (const idx in urls) {
    const u = urls[idx];
    const isDownloadSucc = await new Promise(async (res) => {
      let dldTimer;
      try {
        let count = 0;
        const timer = setInterval(() => {
          slog(
            `正在获取第${Number(idx) + 1}个 YouTube 视频信息...`,
            `${count++}s`
          );
        }, 1000);
        const info = await ytdl.getBasicInfo(u, {
          poToken,
          visitorData,
        });
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
        const formats = info.formats.filter(
          (format) => (format.quality = "720p")
        );
        // fs.writeFileSync(
        //   `./formats-${info.videoDetails.title}.json`,
        //   JSON.stringify(info.formats, undefined, 2)
        // );
        // console.log({ format });
        // 视频总大小
        const totalSize = formats.reduce((total, f) => {
          return total + f.contentLength;
        }, 0);
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
            chalk.blue(`分辨率:${formats[0].qualityLabel}`),
            chalk.gray(` ${dldcount}s `),
            chalk.greenBright(`${progress.percentage.toFixed(2)}%`),
            `${new Array(doneBarLength)
              .fill(chalk.green("█"))
              .join("")}${new Array(totalBarLength - doneBarLength)
              .fill("░")
              .join("")}`
          );
        });

        for (let index = 0; index<formats.length; index ++) {
          slog(`正在下载视频 ${u} 第 ${index+1} 段部分...`)
          const format = formats[index]
          const success = await downloadSingleChunk(format);
          if (success) {
            res(true);
          } else {
            res(false);
          }
        }

        function downloadSingleChunk(format){
          return new Promise((resolve) => {
            ytdl
              .download(u, { format, poToken, visitorData })
              .then((stream) => {
                toPipeableStream(stream)
                  //.pipe(progressStream)
                  .pipe(
                    fs.createWriteStream(
                      path.resolve(
                        __dirname,
                        `./videos/${info.videoDetails.title}/` + dldFilename
                      ),
                      {
                        flags: "a",
                      }
                    )
                  )
                  .on("finish", () => {
                    log(
                      chalk.green(`\n视频下载完成✅`),
                      chalk.redBright(`${info.videoDetails.title}`)
                    );
                    clearInterval(dldTimer);
                    resolve(true);
                  })
                  .on("error", (err) => {
                    log(chalk.red("视频下载出错", err.message));
                    clearInterval(dldTimer);
                    resolve(false);
                  });
              });
          });
        };
      } catch (err) {
        clearInterval(dldTimer);
        res(false);
        console.error(err);
      }
    });
    if (!isDownloadSucc) {
      failDldVideos.push(u);
    }
  }

  if (failDldVideos.length === 0)
    log(chalk.green("视频全部下载完成", `耗时 ${totalSpent}s`));
  else {
    log(chalk.red("这些视频下载失败或者下载没有完成", `耗时 ${totalSpent}s`));
  }
  clearInterval(totalCpentTimer);
})();
