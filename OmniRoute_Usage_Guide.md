# OmniRoute - Complete Usage Guide & Setup Manual
> **Unified Local AI Gateway for All Editors, Coding Agents & AI Tools**

---

## 📌 Table of Contents
1. [Overview](#1-overview)
2. [Quick Start (Start the Gateway)](#2-quick-start)
3. [Accessing the Web Dashboard](#3-accessing-the-web-dashboard)
4. [Adding Providers & API Keys](#4-adding-providers--api-keys)
5. [Using OmniRoute in Any Editor / Tool](#5-using-omniroute-in-any-editor--tool)
   - [Cursor](#a-cursor)
   - [VS Code (Cline / Roo Code / Continue)](#b-vs-code-extensions)
   - [Claude Code CLI](#c-claude-code-cli)
   - [Aider CLI](#d-aider-cli)
   - [Generic OpenAI-Compatible Apps](#e-any-openai-compatible-tool-or-sdk)
6. [Essential Commands Reference](#6-essential-commands-reference)
7. [Auto-Fallback & Smart Routing](#7-auto-fallback--smart-routing)
8. [Troubleshooting & Health Check](#8-troubleshooting--health-check)

---

## 1. Overview

**OmniRoute** is a local-first AI proxy and router running on your machine. It sits between your editors (Cursor, VS Code, Claude Code, etc.) and AI model providers (OpenAI, Claude, Gemini, DeepSeek, Groq, Mistral, Ollama, etc.).

### Key Benefits:
- **Single Endpoint**: One universal URL (`http://localhost:20128/v1`) for all your editors.
- **Auto-Fallback**: If one provider runs out of credits, hits rate limits, or goes down, OmniRoute automatically falls back to an alternative model seamlessly.
- **Cost & Token Compression**: Built-in RTK + Caveman compression reduces token usage and costs.
- **Provider Aggregator**: Connect 350+ AI providers behind one local gateway.

---

## 2. Quick Start

Since OmniRoute is installed globally, you can execute these commands in **any terminal** (PowerShell, CMD, VS Code terminal, Cursor terminal, etc.):

### Start the OmniRoute Server:
```powershell
omniroute
```
*(Alternative explicit command: `omniroute serve`)*

### Run in Background / Manage Server:
```powershell
# Check status of running server
omniroute status

# Stop server
omniroute stop

# Restart server
omniroute restart
```

---

## 3. Accessing the Web Dashboard

Once OmniRoute is running, open the visual management dashboard:

```powershell
omniroute dashboard
```
Or open your web browser manually to:
👉 **[http://localhost:20128](http://localhost:20128)**

### In the Dashboard you can:
- Add and test your API keys for different providers (OpenAI, Anthropic, Google Gemini, DeepSeek, etc.).
- Configure routing rules, fallbacks, and model combinations.
- Monitor token usage, cost reports, and request latencies.
- Generate local API keys for your editors.

---

## 4. Adding Providers & API Keys

### Method A: Via Web Dashboard (Recommended)
1. Open `http://localhost:20128`.
2. Go to **Providers**.
3. Select your provider (e.g. Anthropic, Google Gemini, OpenAI, DeepSeek, Groq, Ollama).
4. Enter your API key and click **Save & Test**.

### Method B: Via CLI
```powershell
# Open interactive provider management
omniroute providers

# Test a provider connection
omniroute test <provider_name> <model_name>
# Example:
omniroute test gemini gemini-1.5-pro
```

---

## 5. Using OmniRoute in Any Editor / Tool

OmniRoute acts as a standard **OpenAI-Compatible** API server running at:
- **Base URL**: `http://localhost:20128/v1`
- **API Key**: Any local OmniRoute key (or master key configured in dashboard)

---

### A. Cursor
OmniRoute provides an automated setup command:
```powershell
omniroute setup-cursor
```
**Manual Configuration in Cursor:**
1. Open Cursor **Settings** (`Ctrl + ,` or top-right gear icon) -> **Cursor Settings** -> **Models**.
2. Turn off models you don't use, or add custom models (e.g. `claude-3-7-sonnet`, `gemini-2.5-pro`, `deepseek-chat`).
3. Under **OpenAI API Key**, configure:
   - **Override OpenAI Base URL**: `http://localhost:20128/v1`
   - **API Key**: Your OmniRoute key (or any dummy string if auth bypass is enabled).

---

### B. VS Code Extensions

#### 1. Cline
Run the auto-configurator:
```powershell
omniroute setup-cline
```
*Or in Cline UI:*
- **API Provider**: `OpenAI-Compatible`
- **Base URL**: `http://localhost:20128/v1`
- **API Key**: Your OmniRoute key
- **Model ID**: Enter your preferred model (e.g., `claude-3-7-sonnet`, `gemini-2.5-pro`, `deepseek-chat`)

#### 2. Roo Code
Run the auto-configurator:
```powershell
omniroute setup-roo
```

#### 3. Continue Extension (`continue.dev`)
Run the auto-configurator:
```powershell
omniroute setup-continue
```

---

### C. Claude Code CLI

OmniRoute has deep native integration for Claude Code:

#### One-Click Profile Setup:
```powershell
omniroute setup-claude
```
This inspects the active models on your OmniRoute server and automatically writes profile configs to `~/.claude/profiles/`.

#### Launch Claude Code directly through OmniRoute:
```powershell
omniroute launch
```

---

### D. Aider CLI
Auto-configure Aider to route through OmniRoute:
```powershell
omniroute setup-aider
```
Then run Aider:
```powershell
aider --openai-api-base http://localhost:20128/v1 --model openai/claude-3-7-sonnet
```

---

### E. Any OpenAI-Compatible Tool or SDK

If you are using Python, Node.js, LangChain, or custom scripts:

#### Python Example:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:20128/v1",
    api_key="your-omniroute-key" # or local machine key
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet", # or gemini-2.5-pro, deepseek-chat
    messages=[{"role": "user", "content": "Hello via OmniRoute!"}]
)
print(response.choices[0].message.content)
```

---

## 6. Essential Commands Reference

| Command | Description |
| :--- | :--- |
| `omniroute` | Starts the OmniRoute gateway server |
| `omniroute dashboard` | Opens the web dashboard in your browser |
| `omniroute doctor` | Diagnoses local setup, database, ports & dependencies |
| `omniroute status` | Displays the status of running server and active nodes |
| `omniroute stop` | Stops the running server |
| `omniroute restart` | Restarts the OmniRoute server |
| `omniroute models` | Lists all available models from active providers |
| `omniroute providers` | Interactive provider & API key manager |
| `omniroute keys` | View and manage API keys |
| `omniroute cost` | Cost breakdown report by provider, model, and combo |
| `omniroute usage` | Analytics on tokens, latency, and requests |
| `omniroute logs` | Live stream request logs |
| `omniroute repl` | Interactive CLI chat REPL |

---

## 7. Auto-Fallback & Smart Routing

One of OmniRoute's best features is **Combos**:
You can define a model alias (e.g. `coding-primary`) that maps to:
1. Primary: `Claude 3.7 Sonnet`
2. First Fallback: `DeepSeek V3 / R1` (if Claude hits rate limit)
3. Second Fallback: `Gemini 2.5 Flash / Pro` (if DeepSeek is slow/unreachable)

In your editor, you simply select `coding-primary`. OmniRoute handles the fallback automatically behind the scenes without interrupting your work.

---

## 8. Troubleshooting & Health Check

### 1. Verify Installation & Health:
Run the built-in diagnostic tool anytime:
```powershell
omniroute doctor
```

### 2. If the Server Fails to Start:
- Check if port `20128` is occupied by another process.
- Run `omniroute doctor` to verify native SQLite bindings.
- View recent crash logs:
  `C:\Users\yashj\.omniroute`

### 3. Check Global Installation Location:
- Global Binary: `C:\Users\yashj\AppData\Roaming\npm\omniroute.cmd`
- Configuration Directory: `C:\Users\yashj\.omniroute`
