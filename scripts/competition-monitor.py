#!/usr/bin/env python3
"""
比赛官网监控
每周一 9:00 抓取 3 个官网，关键词 diff，变化时弹 macOS 通知 + 写日志。

监控对象（截至 2026-05-01）:
1. 深创赛 第 18 届 - 启动通知未发
2. 大湾区创业大赛 第二届 - 启动通知未发
3. 外滩大会 AI 科创赛 2026 - 规则未公告

状态文件: ~/.competition-monitor/state.json
日志文件: ~/Desktop/比赛监控日志.md
"""

import json
import os
import re
import ssl
import subprocess
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".competition-monitor"
STATE_FILE = STATE_DIR / "state.json"
LOG_FILE = Path.home() / "Desktop" / "比赛监控日志.md"

TARGETS = [
    {
        "id": "sz",
        "name": "深创赛",
        "url": "https://stic.sz.gov.cn/xxgk/ztzl/cxcyds/",
        "signal_keywords": ["第十八届", "第18届", "2026年深圳", "2026 深圳", "第十八届创新创业", "启动仪式", "报名通知"],
        "current_baseline": "页面停留在第 17 届（2025）信息",
    },
    {
        "id": "gba",
        "name": "大湾区创业大赛",
        "url": "http://dwqds.newjobs.com.cn/",
        "signal_keywords": ["第二届", "2026", "粤港澳大湾区创业大赛", "启动", "报名", "通知"],
        "current_baseline": "首届 2025 已完赛，第二届启动通知未发",
    },
    {
        "id": "bund",
        "name": "外滩大会 AI 科创赛",
        "url": "https://www.inclusionconf.com/",
        "signal_keywords": ["2026", "Inclusion 2026", "AI 科创大赛 2026", "9 月", "报名", "赛道"],
        "current_baseline": "2025 届完赛，2026 规则未公告",
    },
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2))


def fetch(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            raw = r.read()
            for enc in ("utf-8", "gbk", "gb2312"):
                try:
                    return raw.decode(enc, errors="ignore")
                except Exception:
                    continue
            return raw.decode("utf-8", errors="ignore")
    except Exception as e:
        return f"__FETCH_ERROR__: {e}"


def detect_signals(html, keywords):
    if html.startswith("__FETCH_ERROR__"):
        return {"error": html, "hits": []}
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    hits = [k for k in keywords if k in text]
    return {"error": None, "hits": hits, "length": len(text)}


def notify_macos(title, message):
    safe_title = title.replace('"', "'")
    safe_msg = message.replace('"', "'").replace("\n", " · ")
    script = f'display notification "{safe_msg}" with title "{safe_title}" sound name "Glass"'
    try:
        subprocess.run(["osascript", "-e", script], check=False, timeout=5)
    except Exception:
        pass


def append_log(lines):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    block = [f"\n## {ts}\n"] + lines + ["\n"]
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not LOG_FILE.exists():
        LOG_FILE.write_text("# 比赛官网监控日志\n\n每周一 9:00 自动跑。本文件由 competition-monitor.py 生成，可以手动编辑保留你认为重要的发现。\n")
    with LOG_FILE.open("a") as f:
        f.write("\n".join(block))


def main():
    state = load_state()
    changes = []
    summary = []
    for t in TARGETS:
        html = fetch(t["url"])
        sig = detect_signals(html, t["signal_keywords"])
        prev = state.get(t["id"], {})
        prev_hits = set(prev.get("hits", []))
        new_hits = set(sig.get("hits", []))
        added = sorted(new_hits - prev_hits)
        line = f"- **{t['name']}** ({t['url']})"
        if sig["error"]:
            line += f" · ⚠️ 抓取失败: {sig['error'][:120]}"
            summary.append(line)
        elif added:
            line += f" · 🚨 **新关键词命中**: {', '.join(added)}"
            summary.append(line)
            changes.append(f"{t['name']}: {', '.join(added)}")
        else:
            current = ", ".join(sorted(new_hits)) if new_hits else "无"
            line += f" · ✅ 无新增（命中: {current}）"
            summary.append(line)
        state[t["id"]] = {
            "checked_at": datetime.now().isoformat(),
            "hits": sorted(new_hits),
            "url": t["url"],
        }
    save_state(state)
    append_log(summary)
    if changes:
        notify_macos(
            "🚨 比赛官网更新",
            "; ".join(changes[:3]) + " · 详见 ~/Desktop/比赛监控日志.md",
        )
        print("CHANGES DETECTED:", "; ".join(changes))
        sys.exit(0)
    else:
        print("No changes.")
        sys.exit(0)


if __name__ == "__main__":
    main()
