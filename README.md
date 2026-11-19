# dsh-sloppatterns

[![npm](https://img.shields.io/npm/v/dsh-sloppatterns?logo=npm)](https://www.npmjs.com/package/dsh-sloppatterns)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-green?logo=data:image/svg+xml;base64,PHN2ZyB0PSIxNzg2ODczMTA1MjgwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjY2MzEiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNTEyIDE2QzIzOC4wNjYgMTYgMTYgMjM4LjA2NiAxNiA1MTJzMjIyLjA2NiA0OTYgNDk2IDQ5NiA0OTYtMjIyLjA2NiA0OTYtNDk2Uzc4NS45MzQgMTYgNTEyIDE2eiBtMCA4OTZjLTIyMS4wNjQgMC00MDAtMTc4LjkwMi00MDAtNDAwIDAtMjIxLjA2MiAxNzguOTAyLTQwMCA0MDAtNDAwIDIyMS4wNjQgMCA0MDAgMTc4LjkwMiA0MDAgNDAwIDAgMjIxLjA2NC0xNzguOTAyIDQwMC00MDAgNDAweiBtMjE0LjcwMi0yMDIuMTI4Yy0xOS4yMjggMTkuNDI0LTkxLjA2IDgyLjc5Mi0yMDguMTMgODIuNzkyLTE2NC44NiAwLTI4MC45NjgtMTIyLjg1LTI4MC45NjgtMjgzLjEzNCAwLTE1OC4zMDQgMTIwLjU1LTI3OC44MDIgMjc5LjUyNC0yNzguODAyIDExMS4wNjIgMCAxNzcuNDc2IDUzLjI0IDE5NS4xODYgNjkuNTU4YTIzLjkzIDIzLjkzIDAgMCAxIDMuODcyIDMwLjY0NGwtMzYuMzEgNTYuMjI2Yy03LjY4MiAxMS45LTIzLjkzMiAxNC41NjQtMzQuOTk4IDUuODQyLTE3LjE5LTEzLjU1Mi02My42MjgtNDUuMDc2LTEyMy40MTYtNDUuMDc2LTk2LjYwNiAwLTE1NS44MzIgNzAuNjYtMTU1LjgzMiAxNjAuMTY0IDAgODMuMTc4IDUzLjc3NiAxNjcuMzg0IDE1Ni41NTQgMTY3LjM4NCA2NS4zMTQgMCAxMDMuNjg2LTM4LjA3OCAxMzEuNDUyLTU0LjQ1IDEwLjU0LTkuNzE0IDI3LjE5Mi04LjA3OCAzNS42NCAzLjQ3NmwzOS43MyA1NC4zNGEyMy44OTQgMjMuODk0IDAgMCAxLTIuMzA0IDMxLjAzNnoiIGZpbGw9IiNmZmZmZmYiIHAtaWQ9IjY2MzIiPjwvcGF0aD48L3N2Zz4=)](LICENSE)

一个用于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的插件，把
[Slop Patterns](https://github.com/pavithralamahewa/slop-patterns) 的规则库以原生工具的形式交给
dsh 中的 agent。规则引擎与模式数据随插件内置，所有检查都在本地完成。

## 目录

- [特性](#特性)
- [安装](#安装)
  - [从 npm 安装（推荐）](#从-npm-安装推荐)
  - [从 GitHub 安装](#从-github-安装)
- [使用](#使用)
- [提供的工具](#提供的工具)
- [隐私](#隐私)
- [反馈与安全](#反馈与安全)
- [卸载](#卸载)
- [归属](#归属)
- [许可](#许可)

## 特性

- **完全离线**：不连接 MCP 服务器、不访问网络、不上传代码，也不需要 API Key 或账号。
- **原生工具**：注册 6 个 `slop_*` 工具，覆盖检查、浏览、搜索、详情与版本查询。
- **模型友好的返回**：所有工具返回均为英文，不含中文字符，避免部分模型提供商因中文内容触发风控。
- **版本可追溯**：内置数据固定为 Slop Patterns v1.4.0，检查结果可复现。

## 安装

需要 dsh 0.2.0 或更新版本。安装完成后重启宿主。

### 从 npm 安装（推荐）

**DSH Desktop：** 打开 **设置 → 插件**，搜索 `dsh-sloppatterns`，安装后重启应用。

**dsh web：**

```sh
dsh plugin --profile web add dsh-sloppatterns
```

### 从 GitHub 安装

适合想直接跟随 `main` 分支的情况：

```sh
dsh plugin --profile web add github:XKPU/dsh-sloppatterns
```

GitHub 安装的内容可能比 npm 版本更新；需要可复现的版本时，可以附加 commit，例如
`github:XKPU/dsh-sloppatterns#<commit>`。其它 profile 把命令里的 `web` 换成实际名称即可。

## 使用

安装后，直接让 Agent 使用工具即可，例如：

> 用 sloppatterns 工具检查一下这个组件的设计，有问题就按修复建议改。

也可以明确指定工具：

> 用 `slop_check_design` 检查下面的 JSX，列出命中的反模式和对应的修复方法。

```jsx
<section className="hero">
  <h1 className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
    Ship faster
  </h1>
</section>
```

Agent 会返回命中的模式编号、证据和修复建议。想先了解规则库，可以让它调用
`slop_list_patterns` 查看全部条目，或用 `slop_search_patterns` 按症状搜索。

## 提供的工具

| 工具 | 作用 |
| --- | --- |
| `slop_check_design` | 用本地规则检查 CSS/HTML/JSX 片段，返回命中的每条反模式及其修复建议。 |
| `slop_list_patterns` | 列出完整分类（code、id、名称、一句话描述），可按 `surface` / `behavioral` 过滤。 |
| `slop_search_patterns` | 自然语言搜索，例如 `gradient headline`。 |
| `slop_get_pattern` | 按 id 或 code 查看单条模式全文：表现、为什么工具会产出它、影响谁、怎么修、来源。 |
| `slop_why` | 只返回某条模式的成因解释。 |
| `slop_changelog` | 库版本、发布记录与版本规则。 |

`slop_check_design` 覆盖 104 条代码规则中带有机械判定特征的 101 条反模式；其余条目仍可通过搜索和
`slop_get_pattern` 查看。内置数据为 Slop Patterns **v1.4.0**（534 条模式、104 条规则），对应上游
commit `a3e704f`。

## 隐私

插件在进程内完成全部检查，不发起网络请求，也不收集遥测。代码片段、检查结果和查询内容都不会离开本机。

## 反馈与安全

- 缺陷报告、功能建议与使用问题：见 [SUPPORT.md](SUPPORT.md)。
- 安全漏洞：请勿公开提交 issue，报告方式见 [SECURITY.md](SECURITY.md)。

## 卸载

在应用的插件管理器中移除，或执行：

```sh
dsh plugin --profile web remove dsh-sloppatterns
```

然后重启。

## 归属

这是非官方社区插件。[Slop Patterns](https://github.com/pavithralamahewa/slop-patterns) 由 Precious
Studio 的 Pavithra Lamahewa 维护，采用 MIT 许可；内置数据仍保留 MIT 许可，见
`vendor/slop-patterns/LICENSE`。本插件与其无隶属或背书关系。

## 许可

本项目基于 **GNU General Public License v3.0 Or Later (GPL-3.0-or-later)** 发布。

```
dsh-sloppatterns - 把 Slop Patterns 的规则库以原生工具的形式交给 dsh 中的 agent。
Copyright (C) 2026 K_PU

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```