# CHANGELOG

## [v1.0.1] - 2026-11-19

### Added

- `repository`、`homepage` 与 `bugs` 元数据，使 npm 包能关联到 GitHub 仓库。

### Changed

- dsh 宿主兼容范围限定为 0.2.0 至 0.2.3，包含各版本的预发布版。

## v1.0.0 - 2026-11-19

### Added

- 显式声明 `publishConfig`，设置 `access: "public"`。
- 增加回归测试：拒绝所有工具返回中的汉字与中日韩标点，覆盖全部 534 条模式。
- 增加 `prepack` 钩子，在打包前运行测试，避免数据更新后把中文发送给模型提供商。
- 内置 Slop Patterns v1.4.0（534 条模式、104 条规则，上游 commit `a3e704f`）。
- 六个原生工具：`slop_check_design`、`slop_list_patterns`、`slop_search_patterns`、
  `slop_get_pattern`、`slop_why` 与 `slop_changelog`。
- 针对 101 条具备机械判定特征的模式提供离线检查。

[v1.0.1]: https://github.com/XKPU/dsh-sloppatterns/compare/v1.0.0...v1.0.1
