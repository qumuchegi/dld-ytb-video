import fs from "fs";
import path, { dirname } from "path";
import ytdl from "ytdl-core";
import chalk from "chalk";
import progress from "progress-stream";
import singleLineLog from "single-line-log";
import { fileURLToPath } from "url";

const slog = singleLineLog.stdout;
// 待下载的 YouTube 视频链接
const urls = [
  "https://www.youtube.com/watch?v=DZdUS9cDovQ",
  // "https://www.youtube.com/watch?v=mphHFk5IXsQ",
  // "https://www.youtube.com/watch?v=7m8nON7zf0U",
  // "https://www.youtube.com/watch?v=V8myIkor52g",
];

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
        const info = await ytdl.getInfo(u);
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
          (format) => format.qualityLabel = 'hd720'
        )
        fs.writeFileSync(`./formats-${info.videoDetails.title}.json`, JSON.stringify(info.formats, undefined, 2))
        console.log({format})
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
            `${new Array(doneBarLength).fill(chalk.green("█")).join("")}${new Array(
              totalBarLength - doneBarLength
            )
              .fill("░")
              .join("")}`
          );
        });
        ytdl(u, { format })
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
