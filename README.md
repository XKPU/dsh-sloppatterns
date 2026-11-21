# dsh-sloppatterns

[![npm](https://img.shields.io/npm/v/dsh-sloppatterns?logo=npm)](https://www.npmjs.com/package/dsh-sloppatterns)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-green?logo=data:image/svg+xml;base64,PHN2ZyB0PSIxNzg2ODczMTA1MjgwIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjY2MzEiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNTEyIDE2QzIzOC4wNjYgMTYgMTYgMjM4LjA2NiAxNiA1MTJzMjIyLjA2NiA0OTYgNDk2IDQ5NiA0OTYtMjIyLjA2NiA0OTYtNDk2Uzc4NS45MzQgMTYgNTEyIDE2eiBtMCA4OTZjLTIyMS4wNjQgMC00MDAtMTc4LjkwMi00MDAtNDAwIDAtMjIxLjA2MiAxNzguOTAyLTQwMCA0MDAtNDAwIDIyMS4wNjQgMCA0MDAgMTc4LjkwMiA0MDAgNDAwIDAgMjIxLjA2NC0xNzguOTAyIDQwMC00MDAgNDAweiBtMjE0LjcwMi0yMDIuMTI4Yy0xOS4yMjggMTkuNDI0LTkxLjA2IDgyLjc5Mi0yMDguMTMgODIuNzkyLTE2NC44NiAwLTI4MC45NjgtMTIyLjg1LTI4MC45NjgtMjgzLjEzNCAwLTE1OC4zMDQgMTIwLjU1LTI3OC44MDIgMjc5LjUyNC0yNzguODAyIDExMS4wNjIgMCAxNzcuNDc2IDUzLjI0IDE5NS4xODYgNjkuNTU4YTIzLjkzIDIzLjkzIDAgMCAxIDMuODcyIDMwLjY0NGwtMzYuMzEgNTYuMjI2Yy03LjY4MiAxMS45LTIzLjkzMiAxNC41NjQtMzQuOTk4IDUuODQyLTE3LjE5LTEzLjU1Mi02My42MjgtNDUuMDc2LTEyMy40MTYtNDUuMDc2LTk2LjYwNiAwLTE1NS44MzIgNzAuNjYtMTU1LjgzMiAxNjAuMTY0IDAgODMuMTc4IDUzLjc3NiAxNjcuMzg0IDE1Ni41NTQgMTY3LjM4NCA2NS4zMTQgMCAxMDMuNjg2LTM4LjA3OCAxMzEuNDUyLTU0LjQ1IDEwLjU0LTkuNzE0IDI3LjE5Mi04LjA3OCAzNS42NCAzLjQ3NmwzOS43MyA1NC4zNGEyMy44OTQgMjMuODk0IDAgMCAxLTIuMzA0IDMxLjAzNnoiIGZpbGw9IiNmZmZmZmYiIHAtaWQ9IjY2MzIiPjwvcGF0aD48L3N2Zz4=)](LICENSE)

一个用于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的插件，将 [Slop Patterns](https://github.com/pavithralamahewa/slop-patterns) 的规则库以原生工具的形式交给 dsh 中的 agent。

## 目录

- [特性](#特性)
- [安装](#安装)
  - [从 npm 安装（推荐）](#从-npm-安装推荐)
  - [从 GitHub 安装](#从-github-安装)
- [使用](#使用)
  - [检查代码片段](#检查代码片段)
  - [扫描本地目录](#扫描本地目录)
- [提供的工具](#提供的工具)
- [隐私](#隐私)
- [反馈与安全](#反馈与安全)
- [卸载](#卸载)
- [归属](#归属)
- [许可](#许可)

## 特性

- **完全离线**：无需任何网络访问，您的代码绝不离开您的机器。
- **原生工具**：注册 7 个 `slop_*` 工具，覆盖片段检查、目录扫描、浏览、搜索、详情与版本查询。
- **可检查片段、文件与整个目录**：`slop_check_design` 接收 CSS/HTML/JSX 片段，`slop_scan_path` 递归扫描本地
  HTML 目录并内联本地样式表。
- **模型友好的返回**：所有工具返回均为英文，不含中文字符，~~避免部分模型提供商因中文内容触发风控~~。

## 安装

当前宿主声明为 ≥ 0.2.0，≤ 0.2.3。

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

## 使用

### 检查代码片段

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

### 扫描本地目录

构建完成后，可以让 Agent 直接扫描目录：

> 用 `slop_scan_path` 扫描 `/path/to/project/dist`，只汇总 graded 命中。

`slop_scan_path` 会递归读取 `.html` 与 `.htm` 文件，内联页面引用的本地样式表，并跳过
`node_modules` 与点开头目录。它输出每个文件的命中、干净文件数、跳过原因，以及 graded 模式的汇总。
扫描完全离线，文件内容不会离开本机。

目录扫描默认最多处理 200 个 HTML 文件，单文件上限 2 MB，单次总量上限 20 MB；可用 `maxFiles`
调高文件数上限（最多 1000）。相对路径按 dsh 宿主进程的工作目录解析，建议直接传绝对路径。

`slop_check_design`、`slop_scan_path` 和 `slop_list_patterns` 都支持 `format: "json"`，
便于脚本或其他工具读取。`slop_check_design` 与 `slop_scan_path` 还支持 `strict: true`，
对 `A3`、`A10`、`A15`、`A23`、`A36` 五个 graded 模式返回 `STRICT: PASS` 或 `STRICT: FAIL`。

## 提供的工具

| 工具 | 作用 |
| --- | --- |
| `slop_check_design` | 用本地规则检查 CSS/HTML/JSX 片段，返回命中的每条反模式及其修复建议；支持 `format` 与 `strict`。 |
| `slop_scan_path` | 递归扫描本地 HTML 文件或目录，内联本地样式表，返回逐文件命中、干净数、跳过原因与 graded 汇总；支持 `format`、`strict` 与 `maxFiles`。 |
| `slop_list_patterns` | 列出完整分类（code、id、名称、一句话描述），可按 `surface` / `behavioral` 过滤；支持 `format`。 |
| `slop_search_patterns` | 自然语言搜索，例如 `gradient headline`。 |
| `slop_get_pattern` | 按 id 或 code 查看单条模式全文：表现、为什么工具会产出它、影响谁、怎么修、来源。 |
| `slop_why` | 只返回某条模式的成因解释。 |
| `slop_changelog` | 库版本、发布记录与版本规则。 |

`slop_check_design` 与 `slop_scan_path` 覆盖 104 条代码规则中带有机械判定特征的 101 条反模式；其余
条目仍可通过搜索和 `slop_get_pattern` 查看。检查结果会用 `[graded]` 标出 CLI 定义的五个 graded 模式，
JSON 输出同时包含 `graded`、`strictPass` 与库版本。内置数据为 Slop Patterns **v1.7.0**
（550 条模式、104 条规则），对应上游 commit `2af4186`。

v1.7.0 同步了上游 1.5.0 至 1.7.0 的 16 条新条目，其中 10 条是 agent oversight 模式。这些新增条目
均为人工判断类，没有机械判定规则，因此不会出现在 `slop_check_design` 或 `slop_scan_path` 的结果中；
可以用 `slop_search_patterns` 找到它们，再用 `slop_get_pattern` 阅读全文。

## 隐私

插件在进程内完成全部检查，不发起网络请求，也不收集遥测。代码片段、扫描读取的本地文件、检查结果和
查询内容都不会离开本机。

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