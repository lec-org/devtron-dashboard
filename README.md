# Devtron 控制台

<p align="start">
<a href="https://github.com/devtron-labs/devtron/releases"><img src="https://img.shields.io/github/v/release/devtron-labs/devtron"></a>
<a href="https://discord.gg/jsRG5qx2gp"><img src="https://img.shields.io/discord/687207715902193673?logo=discord&label=Discord&color=5865F2&logoColor=white" alt="Join Discord"></a>
<a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
<img src="https://img.shields.io/github/contributors/devtron-labs/dashboard" alt="contributors">
<img src="https://img.shields.io/github/commit-activity/m/devtron-labs/devtron" alt="Commit Activity">
</p>

[![Dashboard CI](https://github.com/devtron-labs/dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/devtron-labs/dashboard/actions/workflows/ci.yml)

这是 [Devtron](https://github.com/devtron-labs/devtron) 的 Web 前端，使用 React、TypeScript 和 Vite 构建。

本仓库由 `lec-org` 维护，上游为 [devtron-labs/dashboard](https://github.com/devtron-labs/dashboard)。当前分支已加入中文界面、共享组件文案和日期显示支持。中文化维护说明见[中文界面维护](docs/中文界面.md)。SSO 与团队自动发布接入尚待实施。

## 本地开发

项目使用 Yarn 4，仓库中的 Docker 构建环境使用 Node.js 24。请使用兼容的本地环境。

开发代理默认指向上游演示服务 [https://preview.devtron.ai](https://preview.devtron.ai)。连接自己的 Devtron 实例时，在本机的 `.env.secrets` 中配置以下内容，并将示例地址换成实际地址：

```dotenv
VITE_TARGET_URL=https://devtron.example.com
```

`.env.secrets` 已加入忽略清单，不应提交账号、密码或 Token。代理配置位于 `vite.config.mts`。

安装依赖：

```bash
yarn install --immutable
```

启动开发服务，默认地址为 [http://localhost:3000](http://localhost:3000)：

```bash
yarn start
```

检查中文词典、显示转换和协议边界：

```bash
yarn check:zh
```

生成正式构建：

```bash
yarn build
```

更多命令见 `package.json`。构建本仓库得到中文前端产物；安装上游 Helm Chart 并不会自动使用这些产物。

### 提交流程

- 提交前，Husky 会执行 TypeScript 检查，并通过 lint-staged 检查暂存的代码。
- 编译或代码检查失败时，提交会停止。请先修正问题。
- 自动修复可处理的问题：

```bash
yarn lint-fix
```

### 推荐做法

- 页面只保留必要状态，展示组件尽量保持纯粹。
- 一个函数只负责一件事。
- 使用清楚的函数名和变量名；隐晦业务逻辑仍应写明原因。
- 拆分组件时优先考虑复用，让页面负责组织、子组件负责各自的功能。
- 在服务层处理数据解析和接口错误，向页面返回明确的成功或失败结果。
- 按 BEM 约定组织现有 CSS 类名。

### 避免的做法

- 避免在渲染代码中堆放复杂判断，可提取为小函数或子组件。
- 不使用 ID 编写 CSS 选择器。
- 不增加无助于理解的嵌套和缩进。
- 不通过界面文案判断业务状态，应使用稳定的错误码或状态值。
- 布局优先使用 Flexbox 等合适方式，不使用浮动拼凑布局。
- 不在同一个类中混用职责不清的方法。

## 如何参与贡献

1. 选择需要修复的问题或准备增加的功能。
2. 将仓库 Fork 到自己的 GitHub 账号或组织；团队协作时也可以直接在有权限的仓库中创建分支。
3. 克隆仓库：

   ```bash
   git clone https://github.com/lec-org/devtron-dashboard.git
   cd devtron-dashboard
   ```

4. 从当前维护分支创建工作分支，例如 `git checkout -b codex/你的分支名`。
5. 完成修改，运行相关检查和中文化回归。
6. 使用 `git add` 暂存本次修改的具体文件，避免混入无关改动。
7. 使用中文提交说明，例如 `git commit -m '修复应用列表筛选状态'`。
8. 使用 `git push origin 你的分支名` 推送工作分支。
9. 向目标维护分支提交 Pull Request，标题概括变化，描述说明问题、修改内容和验证结果。
10. 根据维护者的审阅意见调整；合并后即可清理工作分支。

向上游贡献时，遵守上游的分支、语言和审阅要求。图片、徽章和上游许可证继续保留原样。
