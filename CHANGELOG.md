# CHANGELOG

## v1.0.0 - 2026-11-19

### Added

- 显式声明 `publishConfig`，设置 `access: "public"`。
- 增加回归测试：拒绝所有工具返回中的汉字与中日韩标点，覆盖全部 534 条模式。
- 增加 `prepack` 钩子，在打包前运行测试，避免数据更新后把中文发送给模型提供商。
- 内置 Slop Patterns v1.4.0（534 条模式、104 条规则，上游 commit `a3e704f`）。
- 六个原生工具：`slop_check_design`、`slop_list_patterns`、`slop_search_patterns`、
  `slop_get_pattern`、`slop_why` 与 `slop_changelog`。
- 针对 101 条具备机械判定特征的模式提供离线检查。