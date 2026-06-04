export type Shortcut = { keys: string; action: string };
export type ShortcutApp = { id: string; name: string; icon: string; groups: { title: string; items: Shortcut[] }[] };

export const SHORTCUT_APPS: ShortcutApp[] = [
  {
    id: "windows", name: "Windows 11", icon: "🪟",
    groups: [
      { title: "Essentials", items: [
        { keys: "Win", action: "Open Start menu" },
        { keys: "Win + E", action: "Open File Explorer" },
        { keys: "Win + D", action: "Show / hide desktop" },
        { keys: "Win + L", action: "Lock the PC" },
        { keys: "Win + I", action: "Open Settings" },
        { keys: "Win + V", action: "Clipboard history" },
        { keys: "Win + .", action: "Emoji picker" },
        { keys: "Alt + Tab", action: "Switch between apps" },
        { keys: "Alt + F4", action: "Close active app" },
        { keys: "Ctrl + Shift + Esc", action: "Open Task Manager" },
      ]},
      { title: "Windows & snapping", items: [
        { keys: "Win + ← / →", action: "Snap window left / right" },
        { keys: "Win + ↑ / ↓", action: "Maximize / minimize window" },
        { keys: "Win + Tab", action: "Task view" },
        { keys: "Win + Ctrl + D", action: "New virtual desktop" },
        { keys: "Win + Ctrl + ← / →", action: "Switch virtual desktop" },
        { keys: "Win + Shift + S", action: "Screenshot (Snip & Sketch)" },
      ]},
    ],
  },
  {
    id: "macos", name: "macOS", icon: "",
    groups: [
      { title: "Essentials", items: [
        { keys: "⌘ + Space", action: "Spotlight search" },
        { keys: "⌘ + Tab", action: "Switch apps" },
        { keys: "⌘ + Q", action: "Quit app" },
        { keys: "⌘ + W", action: "Close window" },
        { keys: "⌘ + , (comma)", action: "App preferences" },
        { keys: "⌘ + Space", action: "Spotlight" },
        { keys: "⌘ + Shift + 4", action: "Screenshot selection" },
        { keys: "⌘ + Shift + 3", action: "Screenshot full screen" },
        { keys: "⌃ + ⌘ + Space", action: "Emoji & symbols" },
        { keys: "⌘ + Option + Esc", action: "Force quit" },
      ]},
      { title: "Editing", items: [
        { keys: "⌘ + C / V / X", action: "Copy / paste / cut" },
        { keys: "⌘ + Z / Shift + Z", action: "Undo / redo" },
        { keys: "⌘ + A", action: "Select all" },
        { keys: "⌘ + F", action: "Find" },
        { keys: "⌘ + ← / →", action: "Start / end of line" },
      ]},
    ],
  },
  {
    id: "vscode", name: "VS Code", icon: "🧩",
    groups: [
      { title: "Navigation", items: [
        { keys: "Ctrl/⌘ + P", action: "Quick open file" },
        { keys: "Ctrl/⌘ + Shift + P", action: "Command palette" },
        { keys: "Ctrl/⌘ + B", action: "Toggle sidebar" },
        { keys: "Ctrl/⌘ + `", action: "Toggle terminal" },
        { keys: "Ctrl/⌘ + Tab", action: "Switch open files" },
        { keys: "Ctrl/⌘ + G", action: "Go to line" },
      ]},
      { title: "Editing", items: [
        { keys: "Alt + ↑ / ↓", action: "Move line up / down" },
        { keys: "Shift + Alt + ↑ / ↓", action: "Copy line up / down" },
        { keys: "Ctrl/⌘ + D", action: "Select next occurrence" },
        { keys: "Ctrl/⌘ + /", action: "Toggle comment" },
        { keys: "Ctrl/⌘ + Shift + K", action: "Delete line" },
        { keys: "Ctrl/⌘ + Shift + L", action: "Select all occurrences" },
        { keys: "F2", action: "Rename symbol" },
        { keys: "Ctrl/⌘ + Space", action: "Trigger suggestions" },
      ]},
    ],
  },
  {
    id: "chrome", name: "Chrome / Browsers", icon: "🌐",
    groups: [
      { title: "Tabs & windows", items: [
        { keys: "Ctrl/⌘ + T", action: "New tab" },
        { keys: "Ctrl/⌘ + Shift + T", action: "Reopen closed tab" },
        { keys: "Ctrl/⌘ + W", action: "Close tab" },
        { keys: "Ctrl/⌘ + Tab", action: "Next tab" },
        { keys: "Ctrl/⌘ + 1…8", action: "Jump to tab number" },
        { keys: "Ctrl/⌘ + N", action: "New window" },
        { keys: "Ctrl/⌘ + Shift + N", action: "Incognito window" },
      ]},
      { title: "Page", items: [
        { keys: "Ctrl/⌘ + L", action: "Focus address bar" },
        { keys: "Ctrl/⌘ + R", action: "Reload" },
        { keys: "Ctrl/⌘ + F", action: "Find on page" },
        { keys: "Ctrl/⌘ + +/−", action: "Zoom in / out" },
        { keys: "F12", action: "Open DevTools" },
        { keys: "Ctrl/⌘ + Shift + I", action: "Open DevTools" },
      ]},
    ],
  },
  {
    id: "excel", name: "Excel / Sheets", icon: "📊",
    groups: [
      { title: "Navigation", items: [
        { keys: "Ctrl + Arrow", action: "Jump to edge of data" },
        { keys: "Ctrl + Home", action: "Go to A1" },
        { keys: "Ctrl + Shift + Arrow", action: "Select to edge" },
        { keys: "Ctrl + Page Up/Down", action: "Switch sheets" },
      ]},
      { title: "Editing & formulas", items: [
        { keys: "Ctrl + ; (semicolon)", action: "Insert today's date" },
        { keys: "Alt + = ", action: "AutoSum" },
        { keys: "Ctrl + Shift + L", action: "Toggle filters" },
        { keys: "F2", action: "Edit active cell" },
        { keys: "F4", action: "Toggle absolute reference" },
        { keys: "Ctrl + Shift + $", action: "Currency format" },
        { keys: "Ctrl + Shift + %", action: "Percent format" },
      ]},
    ],
  },
  {
    id: "photoshop", name: "Photoshop", icon: "🎨",
    groups: [
      { title: "Tools", items: [
        { keys: "V", action: "Move tool" },
        { keys: "B", action: "Brush" },
        { keys: "E", action: "Eraser" },
        { keys: "M", action: "Marquee select" },
        { keys: "L", action: "Lasso" },
        { keys: "C", action: "Crop" },
        { keys: "T", action: "Type" },
      ]},
      { title: "Editing", items: [
        { keys: "Ctrl/⌘ + J", action: "Duplicate layer" },
        { keys: "Ctrl/⌘ + T", action: "Free transform" },
        { keys: "Ctrl/⌘ + Shift + N", action: "New layer" },
        { keys: "Ctrl/⌘ + Alt + Z", action: "Step backward" },
        { keys: "[ / ]", action: "Decrease / increase brush size" },
        { keys: "Ctrl/⌘ + Shift + I", action: "Invert selection" },
      ]},
    ],
  },
  {
    id: "gmail", name: "Gmail", icon: "✉️",
    groups: [
      { title: "Compose & navigate", items: [
        { keys: "C", action: "Compose" },
        { keys: "/", action: "Search mail" },
        { keys: "G then I", action: "Go to Inbox" },
        { keys: "G then S", action: "Go to Starred" },
        { keys: "E", action: "Archive" },
        { keys: "# (Shift + 3)", action: "Delete" },
        { keys: "R", action: "Reply" },
        { keys: "A", action: "Reply all" },
        { keys: "F", action: "Forward" },
        { keys: "Ctrl/⌘ + Enter", action: "Send" },
      ]},
    ],
  },
  {
    id: "terminal", name: "Terminal / Bash", icon: "💻",
    groups: [
      { title: "Line editing", items: [
        { keys: "Ctrl + A / E", action: "Start / end of line" },
        { keys: "Ctrl + U / K", action: "Cut before / after cursor" },
        { keys: "Ctrl + W", action: "Delete previous word" },
        { keys: "Ctrl + R", action: "Reverse history search" },
        { keys: "Ctrl + L", action: "Clear screen" },
        { keys: "Ctrl + C", action: "Cancel command" },
        { keys: "Ctrl + D", action: "EOF / logout" },
        { keys: "Tab", action: "Autocomplete" },
        { keys: "!!", action: "Repeat last command" },
      ]},
    ],
  },
  {
    id: "git", name: "Git", icon: "⑂",
    groups: [
      { title: "Everyday", items: [
        { keys: "git status", action: "Show working tree status" },
        { keys: "git add -p", action: "Stage hunks interactively" },
        { keys: "git commit -m", action: "Commit with message" },
        { keys: "git switch -c <b>", action: "Create & switch branch" },
        { keys: "git pull --rebase", action: "Pull and rebase" },
        { keys: "git log --oneline", action: "Compact history" },
        { keys: "git stash", action: "Shelve changes" },
        { keys: "git reset --soft HEAD~1", action: "Undo last commit, keep changes" },
      ]},
    ],
  },
];
