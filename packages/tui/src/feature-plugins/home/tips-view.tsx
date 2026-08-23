import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import { createMemo, For, type Accessor } from "solid-js"
import { DEFAULT_THEMES, useTheme } from "../../context/theme"
import { useCommandShortcut } from "../../keymap"

const themeCount = Object.keys(DEFAULT_THEMES).length

type TipPart = { text: string; highlight: boolean }
type TipShortcut = Accessor<string>
type Shortcuts = {
  agentCycle: TipShortcut
  childFirst: TipShortcut
  childNext: TipShortcut
  childPrevious: TipShortcut
  commandList: TipShortcut
  editorOpen: TipShortcut
  helpShow: TipShortcut
  inputClear: TipShortcut
  inputNewline: TipShortcut
  inputPaste: TipShortcut
  inputUndo: TipShortcut
  leader: TipShortcut
  messagesCopy: TipShortcut
  messagesFirst: TipShortcut
  messagesLast: TipShortcut
  messagesPageDown: TipShortcut
  messagesPageUp: TipShortcut
  messagesToggleConceal: TipShortcut
  modelCycleRecent: TipShortcut
  modelList: TipShortcut
  sessionExport: TipShortcut
  sessionInterrupt: TipShortcut
  sessionList: TipShortcut
  sessionNew: TipShortcut
  sessionParent: TipShortcut
  sessionPinToggle: TipShortcut
  sessionQuickSwitch1: TipShortcut
  sessionQuickSwitch9: TipShortcut
  sessionSidebarToggle: TipShortcut
  sessionTimeline: TipShortcut
  statusView: TipShortcut
  terminalSuspend: TipShortcut
  themeList: TipShortcut
}
type Tip = string | ((shortcuts: Shortcuts) => string | undefined)

function parse(tip: string): TipPart[] {
  const parts: TipPart[] = []
  const regex = /\{highlight\}(.*?)\{\/highlight\}/g
  const found = Array.from(tip.matchAll(regex))
  const state = found.reduce(
    (acc, match) => {
      const start = match.index ?? 0
      if (start > acc.index) {
        acc.parts.push({ text: tip.slice(acc.index, start), highlight: false })
      }
      acc.parts.push({ text: match[1], highlight: true })
      acc.index = start + match[0].length
      return acc
    },
    { parts, index: 0 },
  )

  if (state.index < tip.length) {
    parts.push({ text: tip.slice(state.index), highlight: false })
  }

  return parts
}

const NO_MODELS_TIP = "运行 {highlight}/connect{/highlight} 添加 AI 服务商，开始编码"
const NO_MODELS_PARTS = parse(NO_MODELS_TIP)

function shortcutText(value: string) {
  return `{highlight}${value}{/highlight}`
}

function commandText(command: string, shortcut: string) {
  if (!shortcut) return shortcutText(command)
  return `${shortcutText(command)} 或 ${shortcutText(shortcut)}`
}

function press(shortcut: string, text: string) {
  if (!shortcut) return undefined
  return `按 ${shortcutText(shortcut)} ${text}`
}

function configShortcut(api: TuiPluginApi, command: string): TipShortcut {
  return () =>
    api.tuiConfig.keybinds
      .get(command)
      .map((binding) => api.keys.formatSequence(Array.from(api.keymap.parseKeySequence(binding.key))))
      .filter(Boolean)
      .join(", ")
}

export function Tips(props: { api: TuiPluginApi; connected?: boolean }) {
  const theme = useTheme().theme
  const tipOffset = Math.random()
  const shortcuts: Shortcuts = {
    agentCycle: useCommandShortcut("agent.cycle"),
    childFirst: configShortcut(props.api, "session.child.first"),
    childNext: configShortcut(props.api, "session.child.next"),
    childPrevious: configShortcut(props.api, "session.child.previous"),
    commandList: useCommandShortcut("command.palette.show"),
    editorOpen: useCommandShortcut("prompt.editor"),
    helpShow: useCommandShortcut("help.show"),
    inputClear: useCommandShortcut("prompt.clear"),
    inputNewline: useCommandShortcut("input.newline"),
    inputPaste: useCommandShortcut("prompt.paste"),
    inputUndo: useCommandShortcut("input.undo"),
    leader: configShortcut(props.api, "leader"),
    messagesCopy: configShortcut(props.api, "messages.copy"),
    messagesFirst: configShortcut(props.api, "session.first"),
    messagesLast: configShortcut(props.api, "session.last"),
    messagesPageDown: configShortcut(props.api, "session.page.down"),
    messagesPageUp: configShortcut(props.api, "session.page.up"),
    messagesToggleConceal: configShortcut(props.api, "session.toggle.conceal"),
    modelCycleRecent: useCommandShortcut("model.cycle_recent"),
    modelList: useCommandShortcut("model.list"),
    sessionExport: configShortcut(props.api, "session.export"),
    sessionInterrupt: configShortcut(props.api, "session.interrupt"),
    sessionList: useCommandShortcut("session.list"),
    sessionNew: useCommandShortcut("session.new"),
    sessionParent: configShortcut(props.api, "session.parent"),
    sessionPinToggle: configShortcut(props.api, "session.pin.toggle"),
    sessionQuickSwitch1: useCommandShortcut("session.quick_switch.1"),
    sessionQuickSwitch9: useCommandShortcut("session.quick_switch.9"),
    sessionSidebarToggle: configShortcut(props.api, "session.sidebar.toggle"),
    sessionTimeline: configShortcut(props.api, "session.timeline"),
    statusView: useCommandShortcut("opencode.status"),
    terminalSuspend: useCommandShortcut("terminal.suspend"),
    themeList: useCommandShortcut("theme.switch"),
  }
  const tip = createMemo(() => {
    if (props.connected === false) return NO_MODELS_TIP
    const tips = [...TIPS, process.platform !== "win32" ? TERMINAL_SUSPEND_TIP : INPUT_UNDO_TIP].flatMap((item) => {
      const value = typeof item === "string" ? item : item(shortcuts)
      return value ? [value] : []
    })
    return tips[Math.floor(tipOffset * tips.length)] ?? NO_MODELS_TIP
  }, NO_MODELS_TIP)
  // Solid can expose a memo's initial value while a pure computation is pending.
  const parts = createMemo(() => {
    const value = tip()
    if (typeof value === "string") return parse(value)
    return NO_MODELS_PARTS
  }, NO_MODELS_PARTS)

  return (
    <box flexDirection="row" maxWidth="100%">
      <text flexShrink={0} style={{ fg: theme.warning }}>
        ● 提示{" "}
      </text>
      <text flexShrink={1} wrapMode="word">
        <For each={parts()}>
          {(part) => <span style={{ fg: part.highlight ? theme.text : theme.textMuted }}>{part.text}</span>}
        </For>
      </text>
    </box>
  )
}

const TIPS: Tip[] = [
  "输入 {highlight}@{/highlight} 加文件名可模糊搜索并附加文件",
  "消息以 {highlight}!{/highlight} 开头可运行 shell 命令（如 {highlight}!ls -la{/highlight}）",
  (shortcuts) => press(shortcuts.agentCycle(), "在 Build 和 Plan 智能体之间切换"),
  "用 {highlight}/undo{/highlight} 撤销上一条消息及其文件变更",
  "用 {highlight}/redo{/highlight} 恢复之前撤销的消息和文件变更",
  "运行 {highlight}/share{/highlight} 创建 opencode.ai 公开链接",
  "把图片或 PDF 拖进终端作为上下文",
  (shortcuts) => press(shortcuts.inputPaste(), "把剪贴板里的图片粘贴到输入框"),
  (shortcuts) => `用 ${commandText("/editor", shortcuts.editorOpen())} 在外部编辑器中撰写消息`,
  "运行 {highlight}/init{/highlight} 根据代码库自动生成项目规则",
  (shortcuts) => `用 ${commandText("/models", shortcuts.modelList())} 切换可用的 AI 模型`,
  (shortcuts) => `用 ${commandText("/themes", shortcuts.themeList())} 在 ${themeCount} 个内置主题间切换`,
  (shortcuts) => `用 ${commandText("/new", shortcuts.sessionNew())} 开启全新的会话`,
  (shortcuts) => `用 ${commandText("/sessions", shortcuts.sessionList())} 列出、置顶并继续会话`,
  (shortcuts) => press(shortcuts.sessionPinToggle(), "（会话列表中）把某个会话置顶"),
  (shortcuts) =>
    shortcuts.sessionQuickSwitch1() && shortcuts.sessionQuickSwitch9()
      ? `用 ${shortcutText(shortcuts.sessionQuickSwitch1())} 到 ${shortcutText(shortcuts.sessionQuickSwitch9())} 快速切换已置顶的会话`
      : undefined,
  "接近上下文上限时，运行 {highlight}/compact{/highlight} 可压缩总结长会话",
  (shortcuts) => `用 ${commandText("/export", shortcuts.sessionExport())} 把对话保存为 Markdown`,
  (shortcuts) => press(shortcuts.messagesCopy(), "把助手的最后一条消息复制到剪贴板"),
  (shortcuts) => press(shortcuts.commandList(), "查看所有可用操作和命令"),
  "运行 {highlight}/connect{/highlight} 为 75+ 受支持的 LLM 服务商配置 API key",
  (shortcuts) => `leader 键是 ${shortcutText(shortcuts.leader())}；与其他键组合可快速操作`,
  (shortcuts) => press(shortcuts.modelCycleRecent(), "在最近使用的模型间快速切换"),
  (shortcuts) => press(shortcuts.sessionSidebarToggle(), "在会话中显示或隐藏侧边栏面板"),
  (shortcuts) =>
    shortcuts.messagesPageUp() && shortcuts.messagesPageDown()
      ? `用 ${shortcutText(shortcuts.messagesPageUp())}/${shortcutText(shortcuts.messagesPageDown())} 翻阅对话历史`
      : undefined,
  (shortcuts) => press(shortcuts.messagesFirst(), "跳到对话开头"),
  (shortcuts) => press(shortcuts.messagesLast(), "跳到最新一条消息"),
  (shortcuts) => press(shortcuts.inputNewline(), "在输入框中换行"),
  (shortcuts) => press(shortcuts.inputClear(), "（输入时）清空输入框"),
  (shortcuts) => press(shortcuts.sessionInterrupt(), "中途停止 AI 回复"),
  "切换到 {highlight}Plan{/highlight} 智能体，只出建议不改代码",
  "在提示中用 {highlight}@智能体名{/highlight} 调用专门的子智能体",
  (shortcuts) => {
    const items = [
      shortcuts.sessionParent(),
      shortcuts.childFirst(),
      shortcuts.childPrevious(),
      shortcuts.childNext(),
    ].filter(Boolean)
    if (!items.length) return undefined
    return `用 ${items.map(shortcutText).join(" / ")} 在父/子会话之间导航`
  },
  "创建 {highlight}opencode.json{/highlight} 配置服务端，{highlight}tui.json{/highlight} 配置 TUI",
  "把 TUI 设置放在 {highlight}~/.config/opencode/tui.json{/highlight} 即为全局配置",
  "在配置里加 {highlight}$schema{/highlight} 可获得编辑器自动补全",
  "在配置中设置 {highlight}model{/highlight} 可指定默认模型",
  "在 {highlight}tui.json{/highlight} 的 {highlight}keybinds{/highlight} 小节覆盖任意快捷键",
  "把任意快捷键设为 {highlight}none{/highlight} 可彻底禁用它",
  "在配置的 {highlight}mcp{/highlight} 小节配置本地或远程 MCP 服务器",
  "把 {highlight}.md{/highlight} 文件放进 {highlight}.opencode/commands/{/highlight} 即为可复用的提示命令",
  "自定义命令里可用 {highlight}$ARGUMENTS{/highlight}、{highlight}$1{/highlight}、{highlight}$2{/highlight} 接收动态参数",
  "用反引号注入 shell 输出（如 {highlight}`git status`{/highlight}）",
  "把 {highlight}.md{/highlight} 文件放进 {highlight}.opencode/agents/{/highlight} 定义专属 AI 角色",
  "可为 {highlight}edit{/highlight}、{highlight}bash{/highlight}、{highlight}webfetch{/highlight} 工具按智能体单独配置权限",
  '用 {highlight}"git *": "allow"{/highlight} 这类模式实现细粒度的 bash 权限',
  '设置 {highlight}"rm -rf *": "deny"{/highlight} 可拦截破坏性命令',
  '配置 {highlight}"git push": "ask"{/highlight} 让推送前需要确认',
  '设置 {highlight}"formatter": true{/highlight} 启用内置格式化器',
  '设置 {highlight}"formatter": false{/highlight} 禁用继承的格式化器',
  "在配置中为特定扩展名定义自定义格式化命令",
  '设置 {highlight}"lsp": true{/highlight} 启用内置 LSP 代码分析',
  "在 {highlight}.opencode/tools/{/highlight} 创建 {highlight}.ts{/highlight} 文件即可定义新的 LLM 工具",
  "工具定义可以调用 Python、Go 等语言编写的脚本",
  "把 {highlight}.ts{/highlight} 文件放进 {highlight}.opencode/plugins/{/highlight} 添加事件钩子",
  "用插件可以在会话完成时发送系统通知",
  "写个插件就能阻止 OpenCode 读取敏感文件",
  "用 {highlight}opencode run{/highlight} 做非交互式脚本调用",
  "用 {highlight}opencode --continue{/highlight} 继续上一个会话",
  "用 {highlight}opencode run -f file.ts{/highlight} 通过 CLI 附加文件",
  "脚本中使用 {highlight}--format json{/highlight} 获得机器可读输出",
  "运行 {highlight}opencode serve{/highlight} 以无头模式提供 API 访问",
  "用 {highlight}opencode run --attach{/highlight} 连接到运行中的服务器",
  "运行 {highlight}opencode upgrade{/highlight} 升级到最新版本",
  "运行 {highlight}opencode auth list{/highlight} 查看已配置的服务商",
  "运行 {highlight}opencode agent create{/highlight} 按引导创建智能体",
  "在 GitHub issue/PR 中使用 {highlight}/opencode{/highlight} 触发 AI 操作",
  "运行 {highlight}opencode github install{/highlight} 安装 GitHub 工作流",
  "在 issue 下评论 {highlight}/opencode fix this{/highlight} 可自动创建 PR",
  "在 PR 代码行评论 {highlight}/oc{/highlight} 进行定点代码审查",
  '用 {highlight}"theme": "system"{/highlight} 跟随终端配色',
  "在 {highlight}.opencode/themes/{/highlight} 目录创建 JSON 主题文件",
  "主题支持深色/浅色两种变体",
  "自定义主题 JSON 中可用 0-255 的 xterm 数字色码",
  "配置中用 {highlight}{env:VAR_NAME}{/highlight} 引用环境变量",
  "配置值中用 {highlight}{file:path}{/highlight} 引入文件内容",
  "配置中的 {highlight}instructions{/highlight} 可加载额外的规则文件",
  "为智能体设置 {highlight}temperature{/highlight}：0.0（专注）到 1.0（发散）",
  "配置 {highlight}steps{/highlight} 限制每次请求的智能体迭代次数",
  '设置 {highlight}"tools": {"bash": false}{/highlight} 禁用特定工具',
  '设置 {highlight}"mcp_*": false{/highlight} 禁用某 MCP 服务器的全部工具',
  "可在各智能体的配置中覆盖全局工具设置",
  '设置 {highlight}"share": "auto"{/highlight} 自动分享所有会话',
  '设置 {highlight}"share": "disabled"{/highlight} 禁止任何会话分享',
  "运行 {highlight}/unshare{/highlight} 取消会话的公开访问",
  "权限 {highlight}doom_loop{/highlight} 可防止无限的工具调用循环",
  "权限 {highlight}external_directory{/highlight} 保护项目之外的文件",
  "运行 {highlight}opencode debug config{/highlight} 排查配置问题",
  "加 {highlight}--print-logs{/highlight} 参数可在 stderr 查看详细日志",
  (shortcuts) => `用 ${commandText("/timeline", shortcuts.sessionTimeline())} 跳转到指定消息`,
  (shortcuts) => press(shortcuts.messagesToggleConceal(), "切换消息中代码块的显示/隐藏"),
  (shortcuts) => `用 ${commandText("/status", shortcuts.statusView())} 查看系统状态信息`,
  "在 {highlight}tui.json{/highlight} 中启用 {highlight}scroll_acceleration{/highlight} 获得平滑滚动",
  (shortcuts) =>
    shortcuts.commandList()
      ? `通过命令面板切换聊天中的用户名显示（${shortcutText(shortcuts.commandList())}）`
      : "通过命令面板切换聊天中的用户名显示",
  "在容器中运行 {highlight}docker run -it --rm ghcr.io/anomalyco/opencode{/highlight}",
  "将 {highlight}/connect{/highlight} 与 OpenCode Zen 搭配，使用精选且经过测试的模型",
  "把项目的 {highlight}AGENTS.md{/highlight} 提交到 Git 与团队共享",
  "用 {highlight}/review{/highlight} 审查未提交的变更、分支或 PR",
  (shortcuts) => `用 ${commandText("/help", shortcuts.helpShow())} 打开帮助对话框`,
  "用 {highlight}/rename{/highlight} 重命名当前会话",
]

const INPUT_UNDO_TIP: Tip = (shortcuts) => press(shortcuts.inputUndo(), "撤销输入框中的改动")
const TERMINAL_SUSPEND_TIP: Tip = (shortcuts) =>
  press(shortcuts.terminalSuspend(), "挂起终端并返回 shell")
