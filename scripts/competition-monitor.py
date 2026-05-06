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

import argparse
import hashlib
import html
import json
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


def parse_args():
    parser = argparse.ArgumentParser(description="Monitor competition websites for keyword and page content changes.")
    parser.add_argument("--dry-run", action="store_true", help="fetch and report without writing state/log files or sending notifications")
    parser.add_argument("--json", action="store_true", help="print machine-readable JSON instead of text")
    parser.add_argument("--target", action="append", default=[], help="target id/name to check; can be repeated or comma-separated")
    parser.add_argument("--log-file", type=Path, default=LOG_FILE, help=f"log file path (default: {LOG_FILE})")
    parser.add_argument("--state-file", type=Path, default=STATE_FILE, help=f"state file path (default: {STATE_FILE})")
    parser.add_argument("--no-notify", action="store_true", help="disable macOS notifications")
    return parser.parse_args()


def load_state(path):
    if path.exists():
        try:
            data = json.loads(path.read_text())
            if isinstance(data, dict):
                return data
        except Exception as e:
            return {"__state_error__": f"Could not read state file: {e}"}
    return {}


def save_state(state, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    state = {k: v for k, v in state.items() if not k.startswith("__")}
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2))


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


def page_text(html_body):
    text = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html_body)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def content_digest(text):
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def detect_signals(html, keywords):
    if html.startswith("__FETCH_ERROR__"):
        return {"error": html, "hits": [], "length": 0, "content_hash": None}
    text = page_text(html)
    hits = [k for k in keywords if k in text]
    return {"error": None, "hits": hits, "length": len(text), "content_hash": content_digest(text)}


def append_log(log_file, sections):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    block = [f"\n## {ts}\n"]
    for title, lines in sections:
        block.append(f"### {title}")
        block.extend(lines or ["- 无"])
        block.append("")
    log_file.parent.mkdir(parents=True, exist_ok=True)
    if not log_file.exists():
        log_file.write_text("# 比赛官网监控日志\n\n每周一 9:00 自动跑。本文件由 competition-monitor.py 生成，可以手动编辑保留你认为重要的发现。\n")
    with log_file.open("a") as f:
        f.write("\n".join(block))


def selected_targets(target_args):
    wanted = []
    for value in target_args:
        wanted.extend(part.strip() for part in value.split(",") if part.strip())
    if not wanted:
        return TARGETS
    lookup = {t["id"]: t for t in TARGETS}
    lookup.update({t["name"]: t for t in TARGETS})
    missing = [name for name in wanted if name not in lookup]
    if missing:
        valid = ", ".join(t["id"] for t in TARGETS)
        raise SystemExit(f"Unknown target: {', '.join(missing)}. Valid target ids: {valid}")
    seen = set()
    targets = []
    for name in wanted:
        target = lookup[name]
        if target["id"] not in seen:
            targets.append(target)
            seen.add(target["id"])
    return targets


def run(args):
    state = load_state(args.state_file)
    state_error = state.pop("__state_error__", None)
    checked_at = datetime.now().isoformat()
    targets = selected_targets(args.target)
    results = []
    changes = []
    errors = []
    summary_lines = []
    change_lines = []
    error_lines = []

    if state_error:
        errors.append({"kind": "state", "message": state_error})
        error_lines.append(f"- 状态文件读取失败: {state_error}")

    for t in targets:
        html_body = fetch(t["url"])
        sig = detect_signals(html_body, t["signal_keywords"])
        prev = state.get(t["id"], {})
        prev_hits = set(prev.get("hits", []))
        new_hits = set(sig.get("hits", []))
        added = sorted(new_hits - prev_hits)
        removed = sorted(prev_hits - new_hits)
        previous_hash = prev.get("content_hash")
        current_hash = sig.get("content_hash")
        content_changed = bool(current_hash and previous_hash and current_hash != previous_hash)
        first_seen = bool(current_hash and not previous_hash)
        current_hits = ", ".join(sorted(new_hits)) if new_hits else "无"

        result = {
            "id": t["id"],
            "name": t["name"],
            "url": t["url"],
            "ok": sig["error"] is None,
            "error": sig["error"],
            "hits": sorted(new_hits),
            "added_hits": added,
            "removed_hits": removed,
            "content_hash": current_hash,
            "previous_hash": previous_hash,
            "content_changed": content_changed,
            "first_seen": first_seen,
            "length": sig.get("length", 0),
        }
        results.append(result)

        if sig["error"]:
            message = sig["error"][:160]
            errors.append({"kind": "fetch", "target": t["id"], "message": sig["error"]})
            summary_lines.append(f"- **{t['name']}** ({t['url']}) · 抓取失败")
            error_lines.append(f"- **{t['name']}**: {message}")
            continue

        summary_lines.append(
            f"- **{t['name']}** ({t['url']}) · 正文 {sig['length']} 字 · 命中: {current_hits}"
        )

        if added:
            changes.append(f"{t['name']}: 新关键词 {', '.join(added)}")
            change_lines.append(f"- **{t['name']}** · 新关键词命中: {', '.join(added)}")
        if removed:
            change_lines.append(f"- **{t['name']}** · 关键词不再命中: {', '.join(removed)}")
        if content_changed:
            changes.append(f"{t['name']}: 页面正文变化")
            change_lines.append(
                f"- **{t['name']}** · 页面正文 hash 变化: {previous_hash[:12]} -> {current_hash[:12]}"
            )
        elif first_seen:
            change_lines.append(f"- **{t['name']}** · 首次记录正文 hash: {current_hash[:12]}")

        state[t["id"]] = {
            "checked_at": checked_at,
            "hits": sorted(new_hits),
            "content_hash": current_hash,
            "content_length": sig.get("length", 0),
            "url": t["url"],
        }

    sections = [
        ("摘要", summary_lines),
        ("变化", change_lines),
        ("错误", error_lines),
    ]

    if not args.dry_run:
        save_state(state, args.state_file)
        append_log(args.log_file, sections)

    notification_error = None
    if changes and not args.no_notify and not args.dry_run:
        notification_error = notify_macos(
            "比赛官网更新",
            "; ".join(changes[:3]) + f" · 详见 {args.log_file}",
        )
        if notification_error:
            errors.append({"kind": "notify", "message": notification_error})

    return {
        "checked_at": checked_at,
        "dry_run": args.dry_run,
        "state_file": str(args.state_file),
        "log_file": str(args.log_file),
        "targets_checked": len(targets),
        "changes_detected": bool(changes),
        "changes": changes,
        "errors": errors,
        "results": results,
        "log_sections": [{"title": title, "lines": lines} for title, lines in sections],
    }


def notify_macos(title, message):
    safe_title = title.replace('"', "'")
    safe_msg = message.replace('"', "'").replace("\n", " · ")
    script = f'display notification "{safe_msg}" with title "{safe_title}" sound name "Glass"'
    try:
        completed = subprocess.run(["osascript", "-e", script], check=False, timeout=5, capture_output=True, text=True)
        if completed.returncode != 0:
            return (completed.stderr or completed.stdout or f"osascript exited {completed.returncode}").strip()
    except Exception as e:
        return str(e)
    return None


def print_text_report(report):
    print(f"Checked {report['targets_checked']} target(s) at {report['checked_at']}")
    if report["dry_run"]:
        print("Dry run: state/log files were not written and notifications were skipped.")
    for section in report["log_sections"]:
        print(f"\n## {section['title']}")
        lines = section["lines"] or ["- 无"]
        for line in lines:
            print(line)


def main():
    args = parse_args()
    report = run(args)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print_text_report(report)
    sys.exit(0)


if __name__ == "__main__":
    main()
