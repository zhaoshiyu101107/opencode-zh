# opencode 中文版（全量简体中文汉化）

基于 [sst/opencode](https://github.com/sst/opencode) **官方 v1.18.21** 源码的全量简体中文汉化版本。

> opencode 是一个运行在终端里的 AI 编程智能体（TUI）。本仓库只做了**界面与提示词的本地化翻译**，不改变任何功能逻辑，不含任何个人定制。

## 汉化范围

| 部分 | 说明 |
|------|------|
| **TUI 终端界面** | 全部对话框（模型/会话/主题/插件/MCP/工作区等）、命令面板、权限确认弹窗、工具执行标题（读取 x / 编辑 x / 已询问 N 个问题…）、diff 查看器全套、侧边栏（上下文/待办/LSP/MCP）、90+ 条主页提示、toast 通知、快捷键帮助面板 |
| **CLI 命令行** | `opencode --help` 全部子命令描述与选项说明、用户可见的错误与提示输出 |
| **LLM 系统提示词** | 14 个系统提示词全部翻译为中文（default / anthropic / gpt / gemini / codex / kimi / beast / trinity / meta / plan 系列），模型将自然以中文思考和回复 |

未翻译的部分：发给模型的工具参数描述（`output:` 字段）、日志输出、代码注释——这些保持英文以保证工具调用可靠性与可检索性。

## 使用

### 直接安装二进制

本仓库 Actions 未配置，可自行构建（见下文），或直接使用已构建好的产物：

```bash
# 克隆后构建（见下方构建章节）
```

### 从源码构建

依赖：[Bun](https://bun.sh) >= 1.3

```bash
git clone https://gitee.com/zhaoshiyu101107/opencode-zh.git
cd opencode-zh
bun install

# 构建当前平台单二进制（嵌入 Web UI）
OPENCODE_VERSION=1.18.21 bun run --cwd packages/opencode build --single

# 产物位于 packages/opencode/dist/opencode-linux-x64/bin/opencode
sudo cp packages/opencode/dist/opencode-linux-x64/bin/opencode /usr/local/bin/opencode
```

> 构建脚本会先构建 Web UI 并嵌入二进制；如网络受限，部分步骤可能需要设置代理环境变量。

## 与上游的差异

- 仅修改字符串文案与提示词文本（约 150 个文件）
- 版本号保持 `1.18.21`，标准 OpenCode 标识
- 不含任何第三方/personal 插件或定制功能

## 同步上游

上游发布新版本后的更新流程：

```bash
# 1. 获取新 tag 并建工作树
git fetch sst https://github.com/sst/opencode --tags
git worktree add ../opencode-zh-new v1.18.22

# 2. 将本分支的改动按文件重放（注意比对上游变更的文件）
# 3. 重新构建
```

## 相关链接

- 上游项目：https://github.com/sst/opencode
- 官方文档：https://opencode.ai

## 许可证

与上游一致，详见 [LICENSE](./LICENSE)。
