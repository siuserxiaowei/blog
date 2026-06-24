# Astro Starter Kit: Minimal

<!-- SIUSER-REPO-GUIDE:START -->
## 项目介绍 / Project Introduction

### 中文
个人博客：记录 AI 工具、自动化、产品笔记和独立构建过程。

### English
Personal blog covering AI tools, automation, product notes, and indie building.

## 使用方式 / Usage

### 中文
1. 先克隆仓库并安装 Node 依赖。
2. 根据 `package.json` 中的 scripts 启动开发、构建或测试命令。
3. 如果有在线入口，先对照线上页面理解最终效果，再回到源码修改。

### English
1. Clone the repository and install the Node dependencies.
2. Use the scripts in `package.json` for development, build, or tests.
3. If a live link exists, review the deployed page first, then make source changes.

## 入口与元信息 / Entry Points & Metadata

- GitHub 仓库 / Repository: https://github.com/siuserxiaowei/blog
- 默认分支 / Default branch: `main`
- 主要语言 / Primary language: `Astro`
- 可见性 / Visibility: `public`
- 仓库类型 / Repository type: `source`

## 本地运行 / Local Run

```bash
git clone https://github.com/siuserxiaowei/blog.git
cd blog
npm install
npm run dev
npm run build
```

## 仓库结构 / Repository Map

| 路径 / Path | 中文说明 | English |
| --- | --- | --- |
| `README.md` | 项目入口说明，先读这里。 | Main project entry point and orientation. |
| `package.json` | Node/前端项目配置、依赖和脚本。 | Node/frontend dependencies and scripts. |
| `src` | 主要源码目录。 | Main source-code directory. |
| `public` | 公开静态资源。 | Public static assets. |
| `docs` | 文档或 GitHub Pages 输出目录。 | Documentation or GitHub Pages output. |
| `scripts` | 构建、同步、生成或维护脚本。 | Build, sync, generation, or maintenance scripts. |
| `.vscode` | 项目文件或目录。 | Project file or directory. |
| `functions` | 项目文件或目录。 | Project file or directory. |
| `.gitignore` | 项目文件或目录。 | Project file or directory. |
| `astro.config.mjs` | 项目文件或目录。 | Project file or directory. |
| `package-lock.json` | npm 依赖锁定文件。 | npm dependency lockfile. |
| `tsconfig.json` | 项目文件或目录。 | Project file or directory. |

## 维护备注 / Maintenance Notes

- 中文：当项目目标、在线入口、运行命令或目录结构变化时，同步更新本说明。
- English: Keep this guide updated when the project purpose, live link, run commands, or structure changes.
- 中文：修改代码、数据或生成页面后，优先运行相关构建、测试或校验命令。
- English: After changing code, data, or generated pages, run the relevant build, test, or validation command.

## 安全与隐私 / Safety & Privacy

- 中文：不要提交 API key、token、密码、cookie、私有链接或内部账号资料。
- English: Do not commit API keys, tokens, passwords, cookies, private URLs, or internal account data.
- 中文：公开 GitHub Pages 前，确认资料已脱敏并允许公开。
- English: Before publishing GitHub Pages output, confirm the material is redacted and cleared for public release.
<!-- SIUSER-REPO-GUIDE:END -->



<!-- SIUSER-SEO-INTRO:START -->

## 项目介绍 / Project Introduction

**中文介绍**：个人博客项目，记录 AI 工具、自动化、内容系统、产品思考和独立开发过程。

**English**: A personal blog for notes on AI tools, automation, content systems, product thinking, and indie building.

**SEO 关键词 / SEO Keywords**: AI blog, automation, product notes, indie hacker, 内容系统

<!-- SIUSER-SEO-INTRO:END -->

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

<!-- SIUSER-CONTACT:START -->

## 联系我 / Contact

想交流 AI 工具、内容自动化、SEO、私域增长或项目合作，可以扫码加我微信。

For collaboration on AI tools, content automation, SEO, private-domain growth, or product experiments, scan the WeChat QR code below.

<img src="https://raw.githubusercontent.com/siuserxiaowei/siuserxiaowei/main/assets/contact/wechat-qrcode.jpg" width="180" alt="WeChat QR code / 微信二维码" />

**关键词 / Keywords**: AI blog, automation, product notes, indie hacker, AI tools, AI automation, GitHub Pages, SEO

<!-- SIUSER-CONTACT:END -->
