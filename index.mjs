import fs from "fs";
import path from 'path'
import ytdl from "ytdl-core";
import chalk from 'chalk'
import progress from 'progress-stream'
import ProgressBar from 'progress'

// 待下载的 YouTube 视频链接
const urls = ["https://www.youtube.com/watch?v=mphHFk5IXsQ"];

const log = console.log
Promise.allSettled(
  urls.map(async (u,i) => {
    const info = await ytdl.getInfo(u)
    console.log({info})
    // 视频总大小
    const totalSize = info.formats
      .find(format => format.itag === 18).contentLength;
    const progressBar = new ProgressBar(':bar', { total: parseInt(totalSize, 10) })
    // 创建进度流
    console.log({totalSize})
    const progressStream = progress({
      length: parseInt(totalSize, 10),
      time: 1000 // 每秒更新一次进度
    });
    progressStream.on('progress', (progress) => {
      log(chalk.blue(`正在下载视频:`), chalk.red(u), chalk.magenta(info.videoDetails.title), chalk.cyan(`Progress: ${(progress.percentage).toFixed(2)}% (${progress.transferred}/${progress.length})`))
    })
    ytdl(u)
      .pipe(fs.createWriteStream(path.resolve(__dirname, './videos/' + i +"-video.mp4")))
      .on("progress", (p) => {
        console.log(p)
      })
      .on('finish', () => log(chalk.green('视频下载完成✅')))
      .on('error', err => {
        log(chalk.red('视频下载出错', err.message))
      })
  })
)
