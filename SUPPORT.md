# 支持

插件的一般说明见 [README.md](README.md)。

## 目录

- [提问之前](#提问之前)
    - [更新时提示「其他配置仍在使用这个组合包的组件」](#更新时提示其他配置仍在使用这个组合包的组件)
- [报告缺陷与建议](#报告缺陷与建议)
- [安全](#安全)
- [参与贡献](#参与贡献)
- [许可](#许可)

## 提问之前

### 更新时提示「其他配置仍在使用这个组合包的组件」

这是 dsh 桌面端的组合包保护：更新会先移除旧包、再安装新包，而移除前它要求插件已经卸载。当同一次
会话里刚安装过其他插件、配置组合暂时无法完整重载时，这一步卸载会失败，于是报出该提示。它不代表插件在
后台占用着资源，也不影响已经注册的工具和数据。

按下面任一方式处理后即可更新：

1. **（推荐）先停用再更新**：在 **设置 → 插件** 中把 `dsh-sloppatterns` 的开关关掉，然后执行更新，
   更新完成后再把开关打开。停用走的是纯粹的卸载路径，不受该保护影响。
2. 关闭并重新打开 dsh 桌面端，然后立即更新（全新启动时卸载会正常完成）。
3. 直接重试一次更新，有时第二次就能成功。

无论采用哪种方式，插件设置和检查结果都不会丢失；插件的组合包条目也会被自动恢复，不会在下次启动时消失。

## 报告缺陷与建议

缺陷报告、功能建议与使用疑问，请提交到 GitHub Issues：

[https://github.com/XKPU/dsh-sloppatterns/issues](https://github.com/XKPU/dsh-sloppatterns/issues)

### 一份有用的缺陷报告通常包含

1. **你做了什么** —— 导致问题的操作步骤。
2. **预期结果** 与 **实际结果**。
3. **环境** —— DSH 版本、插件版本、操作系统。
4. **dsh-sloppatterns 工具返回内容**（可选） —— 若出错时工具返回了内容。
5. **DSH 日志**（可选） —— 若你能够找到日志

> **请勿附带含有 API Key 或个人数据的日志或配置文件。**

## 安全

发现安全问题请**不要**开公开 issue。可通过以下渠道私下报告：

- GitHub 安全公告：[https://github.com/XKPU/dsh-sloppatterns/security/advisories/new](https://github.com/XKPU/dsh-sloppatterns/security/advisories/new)
- 邮箱：`csaxongmail@gmail.com` 或 `u-eptm@u-eptm.top`

更详细的内容见 [SECURITY.md](SECURITY.md)。

## 参与贡献

欢迎提交 Pull Request 或参与 Issue 讨论。

**未完成或未经测试的提交**同样欢迎，请在提交时说明其状态。

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