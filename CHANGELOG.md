# CHANGELOG

## [v1.1.0](https://github.com/XKPU/dsh-sloppatterns/compare/v1.0.1...v1.1.0) - 2026-11-21

### Added

- 新增 `slop_scan_path`：递归扫描本地 `.html` / `.htm` 文件或目录，内联页面引用的本地样式表，
  跳过 `node_modules` 与点开头目录，返回逐文件命中、干净数、跳过原因与 graded 汇总。
- `slop_check_design`、`slop_scan_path` 与 `slop_list_patterns` 支持 `format: "json"`。
- `slop_check_design` 与 `slop_scan_path` 支持 `strict: true`，对 `A3`、`A10`、`A15`、`A23`、
  `A36` 五个 graded 模式返回 `STRICT: PASS` 或 `STRICT: FAIL`。
- 检查结果用 `[graded]` 标出五个 graded 模式；JSON 输出包含 `graded`、`strictPass` 与库版本。
- 内置数据同步至 Slop Patterns v1.7.0（550 条模式），包含上游 PR [#47](https://github.com/pavithralamahewa/slop-patterns/pull/47)、[#48](https://github.com/pavithralamahewa/slop-patterns/pull/48)、[#49](https://github.com/pavithralamahewa/slop-patterns/pull/49)；新增 16 条人工判断类模式，
  其中 10 条为 agent oversight 模式。代码规则仍为 104 条。

### Changed

- 原生工具数量由 6 个增加到 7 个。
- 目录扫描默认最多处理 200 个 HTML 文件（`maxFiles` 可调至 1000），单文件上限 2 MB，单次总量
  上限 20 MB。

## [v1.0.1](https://github.com/XKPU/dsh-sloppatterns/compare/v1.0.0...v1.0.1) - 2026-11-19

### Added

- `repository`、`homepage` 与 `bugs` 元数据，使 npm 包能关联到 GitHub 仓库。

### Changed

- dsh 宿主兼容范围限定为 0.2.0 至 0.2.3，包含各版本的预发布版。

## [v1.0.0](https://github.com/XKPU/dsh-sloppatterns/compare/1d4496a49a87769b4e057015be1beac60a9fb771...v1.0.0) - 2026-11-19

### Added

- 显式声明 `publishConfig`，设置 `access: "public"`。
- 增加回归测试：拒绝所有工具返回中的汉字与中日韩标点，覆盖全部 534 条模式。
- 增加 `prepack` 钩子，在打包前运行测试，避免数据更新后把中文发送给模型提供商。
- 内置 Slop Patterns v1.4.0（534 条模式、104 条规则，上游 commit `a3e704f`）。
- 六个原生工具：`slop_check_design`、`slop_list_patterns`、`slop_search_patterns`、
  `slop_get_pattern`、`slop_why` 与 `slop_changelog`。
- 针对 101 条具备机械判定特征的模式提供离线检查。
