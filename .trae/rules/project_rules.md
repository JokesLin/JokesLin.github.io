# Skill 调用优先级规则

## 规则 1：brainstorming 与 frontend-design 的链式调用

当用户请求涉及"创建/构建前端组件、页面或应用"时，两个 Skill 同时匹配，按以下顺序执行：

1. **先调 brainstorming** — 探索用户意图、需求、设计方向
2. brainstorming 完成后 → **自动调 frontend-design** — 执行具体设计与实现

即：brainstorming 优先级高于 frontend-design，前者负责"想清楚"，后者负责"动手做"。

## 规则 2：TRAE-code-review 与 TRAE-security-review 的职责分界

| 维度 | TRAE-code-review | TRAE-security-review |
|------|------------------|---------------------|
| 关注点 | 代码质量、正确性、最佳实践 | 安全漏洞、风险、敏感信息泄露 |
| 适用场景 | PR 涉及逻辑/功能/风格变更 | PR 涉及认证/加密/输入/数据相关变更 |
| 同时匹配 | 两个都匹配时，**先跑 security-review 再跑 code-review** |

安全审查优先于代码质量审查，因为安全问题比代码风格问题更严重。