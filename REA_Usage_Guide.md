# REA (Reverse Engineer Anything) - Complete Usage Guide
> **Reverse engineer anything from your terminal or AI coding agents with one CLI and MCP server.**
> GitHub: [https://github.com/morluto/rea](https://github.com/morluto/rea)

---

## 📌 Table of Contents
1. [Overview](#1-overview)
2. [Global Installation Verification](#2-global-installation-verification)
3. [Agent & MCP Integration](#3-agent--mcp-integration)
   - [Claude Code](#a-claude-code)
   - [Cursor & Windsurf](#b-cursor--windsurf)
   - [Claude Desktop](#c-claude-desktop)
4. [Key CLI Capabilities](#4-key-cli-capabilities)
   - [Electron & JavaScript Apps](#a-electron--javascript-source-recovery)
   - [Web Apps & Network Sessions](#b-web-apps--cdp-inspection)
   - [Android APK Analysis (ADB)](#c-android-apk-analysis)
   - [Native Binaries (PE / Mach-O / ELF)](#d-native-binaries--decompilation)
5. [Essential Command Reference](#5-essential-command-reference)
6. [Troubleshooting & Help](#6-troubleshooting--help)

---

## 1. Overview

**REA** (`rea-agents`) allows AI coding agents (Claude, Cursor, Codex, Gemini) and developers to inspect, trace, and reverse engineer compiled applications, JavaScript bundles, Electron apps, Android APKs, and native binaries locally without uploading private code to third-party cloud servers.

Instead of hallucinations, REA extracts structured evidence graphs, control flow, functions, network captures, and decompiled code directly into your AI agent's context.

---

## 2. Global Installation Verification

REA is installed globally on your machine:
```powershell
rea --version
```
Expected output:
```text
6.4.0
```

---

## 3. Agent & MCP Integration

### A. Automatic Setup for Coding Agents
Run the built-in interactive setup:
```powershell
rea setup
```
This detects installed AI agents (Claude Code, Cursor, Windsurf, etc.) and configures them automatically.

### B. Registering as MCP Server (Model Context Protocol)
To inspect or configure REA as an MCP server for your coding tools:
```powershell
# Run MCP doctor check
rea mcp doctor

# Add MCP server configuration to target agent
rea mcp add
```

### C. Manual MCP Configuration
If your editor requires manual MCP configuration (e.g. `claude_desktop_config.json` or `.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "rea": {
      "command": "rea",
      "args": ["--mcp"]
    }
  }
}
```

---

## 4. Key CLI Capabilities

### A. Electron & JavaScript Source Recovery
Inspect packaged Electron apps (`.asar`) and recover readable source code:
```powershell
# Recover readable JavaScript sources with verified files
rea recover-javascript-sources <path_to_app_or_asar>

# List Electron targets exposed via CDP
rea list-electron-targets
```

### B. Web Apps & CDP Inspection
Passively inspect live browser pages, event listeners, and network captures:
```powershell
# Inspect web page through CDP
rea inspect-web-page

# Inspect event listeners attached to DOM elements
rea inspect-web-event-listeners

# Inspect HAR network captures
rea inspect-web-network-capture <file.har>
```

### C. Android APK Analysis (with ADB)
Analyze Android packages, activities, and application graphs:
```powershell
# List attached devices
rea list-adb-devices

# List installed packages
rea list-adb-packages

# Project application graph from an APK
rea project-android-application-graph <app.apk>
```

### D. Native Binaries & Decompilation
Inspect Windows PE executables, Mach-O, or ELF binaries:
```powershell
# Inspect PE resources, sections, and metadata
rea inspect-pe-resources <binary.exe>

# Inspect native function boundaries
rea inspect-native-api <binary_path> <function_name>

# Trace native values and call targets
rea resolve-native-call-targets <binary_path>
```

---

## 5. Essential Command Reference

| Command | Purpose |
| :--- | :--- |
| `rea --help` | View all available analysis commands |
| `rea setup` | Interactive wizard to configure agents and decompilers |
| `rea mcp add` | Register REA with supported AI agents via MCP |
| `rea mcp doctor` | Diagnose health of MCP integrations |
| `rea providers` | List configured local analysis providers |
| `rea recover-javascript-sources` | Unpack and decompile JavaScript/Electron apps |
| `rea search` | Search analyzed strings and procedures |
| `rea trace` | Trace features through analyzed code references |
| `rea --mcp` | Start REA in stdio MCP server mode |

---

## 6. Output Formatting for AI Agents

REA commands support flexible formatting to easily feed into LLMs:
- **Markdown**: `rea <command> --format md`
- **JSON**: `rea <command> --format json`
- **Token Count**: `rea <command> --token-count` (checks context window usage before sending)
- **Token Limit**: `rea <command> --token-limit 4000` (caps output to fit model limits)
