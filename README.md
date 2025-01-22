youtube 视频批量下载

使用方法:

0. 先挂上 VPN，确保能正常访问 YouTube.

1. 从 YouTube 网站复制视频 url ，粘贴到 index.mjs 的 urls 数组中:

    ```js
    // 待下载的 YouTube 视频链接
    const urls = [
      "https://www.youtube.com/watch?v=mphHFk5IXsQ",
      "https://www.youtube.com/watch?v=7m8nON7zf0U",
      "https://www.youtube.com/watch?v=V8myIkor52g",
    ];
    ```

2. 执行 `npm run install-video`

3. 下载完成后在文件夹 `videos/` 查看下载好的视频和对应的附加信息
