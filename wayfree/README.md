# 心晴 · Wayfree

手机旅行规划网站，拟部署到 hettydiao.github.io/wayfree/。

## 当前部署结构
本目录作为 `wayfree/` 添加到 `hettydiao/hettydiao.github.io` 的 main 分支，沿用现有主页的 GitHub Pages 发布流程。主页根目录文件和配置保持原样。

发布路径为 `/wayfree/`，规划入口为 index.html，统计页为 stats.html。此项目不需要 npm 安装或构建。

## 功能与范围
目的地、多选城市、日期/人数/年龄/预算、偏好、三套可编辑方案、酒店及民宿实景、官方或携程预订入口、温馨提示和导出均在浏览器运行。全部 123 张图片随站点提供，没有依赖 chatgpt.site、Google 字体或外部图片 CDN。外部预订和资料来源仍需联网。

个人草稿存在本浏览器。当前累计统计也是本机范围，可在 stats.html 查看、导出 CSV；不是全站汇总。不保存身份、精确日期/年龄或自填文字到累计统计。

config.js 预留 WAYFREE_STATS_BASE：配置为 HTTPS 接口基址（如以 /api/ 结尾）后，会额外向 metrics 端点 POST 已验证的匿名计数载荷，向 stats 端点 GET 累计计数。后端需允许当前站点 Origin 的 CORS（含 OPTIONS 与 Content-Type），并按相同规则验证载荷。默认留空，不访问外部统计服务器。配置文件不能含密码、GitHub token 或秘密 API key。

统计后端接口失败不影响规划；全站统计读取失败会明确回退到本机数据。远程写入未实现离线补发，可能漏计。历史原站统计未复制。未来接入全站统计时请核对隐私提示与计数口径。

## 更新
修改仓库里的 app.js、data.json、style.css 或 assets 后提交即可重新发布。此包无需 npm 安装或构建。
