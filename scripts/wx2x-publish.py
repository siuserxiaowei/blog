#!/usr/bin/env python3
"""
公众号文章 → X Articles 一键发布

用法:
    python wx2x-publish.py <公众号文章URL>
    python wx2x-publish.py <本地markdown文件>

流程:
    1. 获取并解析公众号文章（或本地 Markdown）
    2. 转换为 X Articles 兼容 HTML
    3. 下载文章图片到本地
    4. 用 Playwright 打开 X Articles 编辑器
    5. 自动填入标题、粘贴内容
    6. 逐个插入图片（替换 @@@IMG_N@@@ 占位符）
    7. 保存为草稿（不会自动发布）

依赖:
    pip install playwright Pillow
    playwright install chromium

注意: 需要先在浏览器登录 X（Twitter），脚本会使用已有的浏览器配置。
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from html.parser import HTMLParser


# ===== HTML Parser for WeChat articles =====
class WxArticleParser(HTMLParser):
    """Parse WeChat article HTML and extract structured content."""

    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.in_content = False
        self.content_html = ""
        self.images = []
        self._tag_stack = []
        self._skip_tags = {"script", "style", "noscript"}
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Title
        if attrs_dict.get("id") == "activity-name" or "rich_media_title" in attrs_dict.get("class", ""):
            self.in_title = True
            return

        # Content area
        if attrs_dict.get("id") == "js_content" or "rich_media_content" in attrs_dict.get("class", ""):
            self.in_content = True
            return

        if not self.in_content:
            return

        # Skip script/style
        if tag in self._skip_tags:
            self._skip_depth += 1
            return
        if self._skip_depth > 0:
            return

        # Collect images
        if tag == "img":
            src = attrs_dict.get("data-src") or attrs_dict.get("src", "")
            if src and not src.startswith("data:") and "res.wx.qq.com" not in src:
                if src.startswith("//"):
                    src = "https:" + src
                self.images.append(src)

    def handle_endtag(self, tag):
        if tag in self._skip_tags and self._skip_depth > 0:
            self._skip_depth -= 1

        if self.in_title and tag in ("h1", "h2", "div", "span"):
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data.strip()


def fetch_wx_article(url: str) -> str:
    """Fetch WeChat article HTML with proper UA."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def parse_wx_html(html: str) -> dict:
    """Parse WeChat article HTML into structured data."""
    from html.parser import HTMLParser
    import re

    # Extract title
    title_match = re.search(r'var\s+msg_title\s*=\s*["\'](.+?)["\']', html)
    if title_match:
        title = title_match.group(1).strip()
    else:
        title_match = re.search(r'<h1[^>]*class="[^"]*rich_media_title[^"]*"[^>]*>(.*?)</h1>', html, re.DOTALL)
        if title_match:
            title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
        else:
            title_match = re.search(r'id="activity-name"[^>]*>([^<]+)', html)
            title = title_match.group(1).strip() if title_match else "未知标题"

    # Extract content from js_content div
    content_match = re.search(r'id="js_content"[^>]*>(.*?)</div>\s*(?:<script|<div[^>]*class="rich_media_tool")', html, re.DOTALL)
    if not content_match:
        content_match = re.search(r'class="rich_media_content[^"]*"[^>]*>(.*?)</div>\s*(?:<script|<div)', html, re.DOTALL)

    if not content_match:
        print("Warning: Could not find article content", file=sys.stderr)
        return {"title": title, "html": "", "images": []}

    content_html = content_match.group(1)

    # Extract images
    images = []
    seen = set()
    for match in re.finditer(r'(?:data-src|src)=["\']([^"\']+)["\']', content_html):
        src = match.group(1)
        if src.startswith("//"):
            src = "https:" + src
        if src.startswith("data:") or "res.wx.qq.com" in src:
            continue
        if src not in seen:
            seen.add(src)
            images.append(src)

    return {"title": title, "html": content_html, "images": images}


def html_to_clean_x_html(raw_html: str, title: str, images: list, img_dir: str) -> tuple:
    """Convert WeChat HTML to clean X Articles HTML.

    Returns (preview_html, copy_html, downloaded_images)
    """
    from html.parser import HTMLParser
    import re

    # Simple conversion: strip all tags, rebuild with clean structure
    # Remove scripts, styles
    clean = re.sub(r'<(script|style|noscript)[^>]*>.*?</\1>', '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Remove hidden elements
    clean = re.sub(r'<[^>]*display:\s*none[^>]*>.*?</[^>]+>', '', clean, flags=re.DOTALL)
    # Clean HTML entities
    clean = clean.replace('&nbsp;', ' ')
    clean = clean.replace('&#160;', ' ')
    clean = re.sub(r'&amp;nbsp;', ' ', clean)

    # Build clean HTML
    lines = []
    img_idx = 0
    downloaded = []

    # Track image positions
    img_pattern = re.compile(r'(?:data-src|src)=["\']([^"\']+)["\']')

    # Split by block-level tags
    blocks = re.split(r'<(?:p|div|section|h[1-6]|blockquote|pre|ul|ol|li|br\s*/?)[\s>]', clean)

    # Simpler approach: extract text and structure
    # Remove all tags but preserve structure
    text_content = re.sub(r'<br\s*/?\s*>', '\n', clean)
    text_content = re.sub(r'</(?:p|div|section)>', '\n\n', text_content)
    text_content = re.sub(r'</(?:h[1-6])>', '\n\n', text_content)

    # Find bold text patterns
    bold_texts = set()
    for m in re.finditer(r'<(?:strong|b)[^>]*>(.*?)</(?:strong|b)>', clean, re.DOTALL):
        bold_texts.add(re.sub(r'<[^>]+>', '', m.group(1)).strip())

    # Find heading patterns
    heading_texts = {}
    for m in re.finditer(r'<h([1-6])[^>]*>(.*?)</h\1>', clean, re.DOTALL):
        heading_texts[re.sub(r'<[^>]+>', '', m.group(2)).strip()] = int(m.group(1))

    # Find code blocks
    code_blocks = []
    for m in re.finditer(r'<pre[^>]*>(.*?)</pre>', clean, re.DOTALL):
        code_text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        code_blocks.append(code_text)

    # Find blockquotes
    quote_texts = []
    for m in re.finditer(r'<blockquote[^>]*>(.*?)</blockquote>', clean, re.DOTALL):
        quote_texts.append(re.sub(r'<[^>]+>', '', m.group(1)).strip())

    # Strip all remaining tags
    plain = re.sub(r'<[^>]+>', '', text_content)
    plain = re.sub(r'\n{3,}', '\n\n', plain).strip()

    # Build HTML output
    html_parts = [f'<h1>{escape_html(title)}</h1>']
    current_img = 0

    for para in plain.split('\n\n'):
        para = para.strip()
        if not para:
            continue

        # Check if this is a heading
        if para in heading_texts:
            level = min(heading_texts[para], 3)
            html_parts.append(f'<h{level}>{escape_html(para)}</h{level}>')
            continue

        # Check if this is a code block
        is_code = False
        for code in code_blocks:
            if para in code or code in para:
                code_lines = code.split('\n')
                html_parts.append('<blockquote>' + '<br>'.join(escape_html(l) for l in code_lines) + '</blockquote>')
                is_code = True
                break
        if is_code:
            continue

        # Check image position (rough heuristic)
        if current_img < len(images):
            # Insert image marker at roughly correct positions
            pass

        # Apply bold
        escaped = escape_html(para)
        for bt in bold_texts:
            ebt = escape_html(bt)
            if ebt in escaped:
                escaped = escaped.replace(ebt, f'<strong>{ebt}</strong>')

        html_parts.append(f'<p>{escaped}</p>')

    # Insert image markers between content
    # Simple approach: distribute images evenly if we can't determine exact positions
    if images:
        step = max(1, len(html_parts) // (len(images) + 1))
        for i, img_url in enumerate(images):
            pos = min((i + 1) * step, len(html_parts))
            marker = f'<p>@@@IMG_{i + 1}@@@</p>'
            html_parts.insert(pos + i, marker)  # +i because we're inserting

            # Download image
            local_path = download_image(img_url, img_dir, i + 1)
            if local_path:
                downloaded.append({"index": i + 1, "path": local_path, "url": img_url})

    result_html = ''.join(html_parts)
    return result_html, downloaded


def escape_html(s: str) -> str:
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def download_image(url: str, img_dir: str, index: int) -> str:
    """Download image to local directory."""
    os.makedirs(img_dir, exist_ok=True)
    ext = ".jpg"
    if ".png" in url.lower():
        ext = ".png"
    elif ".gif" in url.lower():
        ext = ".gif"
    elif ".webp" in url.lower():
        ext = ".webp"

    local_path = os.path.join(img_dir, f"img_{index:02d}{ext}")
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(local_path, 'wb') as f:
                f.write(resp.read())
        print(f"  Downloaded: img_{index:02d}{ext}", file=sys.stderr)
        return local_path
    except Exception as e:
        print(f"  Warning: Failed to download image {index}: {e}", file=sys.stderr)
        return None


def copy_html_to_clipboard_mac(html: str):
    """Copy HTML to macOS clipboard as rich text."""
    # Write HTML to temp file
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html)
    tmp.close()

    # Use osascript to copy HTML as rich text
    script = f'''
    set theFile to POSIX file "{tmp.name}"
    set theHTML to read theFile as «class utf8»
    set the clipboard to theHTML
    '''
    # Alternative: use pbcopy with HTML
    # Actually, best approach for Mac: use NSPasteboard via Python
    try:
        import AppKit
        import Foundation

        pb = AppKit.NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.setString_forType_(html, AppKit.NSPasteboardTypeHTML)
        # Also set plain text
        plain = re.sub(r'<[^>]+>', '', html)
        pb.setString_forType_(plain, AppKit.NSPasteboardTypeString)
        return True
    except ImportError:
        # Fallback: use subprocess
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(html.encode('utf-8'))
        return True
    finally:
        os.unlink(tmp.name)


def copy_image_to_clipboard_mac(image_path: str):
    """Copy image to macOS clipboard."""
    try:
        import AppKit
        import Foundation

        img = AppKit.NSImage.alloc().initWithContentsOfFile_(image_path)
        if not img:
            print(f"  Failed to load image: {image_path}", file=sys.stderr)
            return False

        pb = AppKit.NSPasteboard.generalPasteboard()
        pb.clearContents()
        pb.writeObjects_([img])
        return True
    except ImportError:
        # Fallback using osascript
        script = f'''
        set theImage to (read POSIX file "{image_path}" as «class PNGf»)
        set the clipboard to theImage
        '''
        subprocess.run(['osascript', '-e', script], capture_output=True)
        return True


def publish_to_x(title: str, html: str, images: list, headless: bool = False):
    """Use Playwright to publish article to X Articles editor."""
    from playwright.sync_api import sync_playwright

    print("\n🚀 启动浏览器，准备发布到 X Articles...", file=sys.stderr)

    with sync_playwright() as p:
        # Use persistent context to keep login state
        user_data_dir = os.path.expanduser("~/.wx2x-browser-data")

        # Detect proxy from environment
        proxy_url = os.environ.get("http_proxy") or os.environ.get("HTTP_PROXY") or os.environ.get("https_proxy")
        launch_opts = {
            "headless": headless,
            "args": ["--disable-blink-features=AutomationControlled"],
            "viewport": {"width": 1280, "height": 900},
            "timeout": 60000,
        }
        if proxy_url:
            launch_opts["proxy"] = {"server": proxy_url}
            print(f"  🌐 使用代理: {proxy_url}", file=sys.stderr)

        browser = p.chromium.launch_persistent_context(user_data_dir, **launch_opts)

        page = browser.pages[0] if browser.pages else browser.new_page()

        # Navigate to X Articles editor
        print("  📝 打开 X Articles 编辑器...", file=sys.stderr)
        page.goto("https://x.com/compose/articles", wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)

        # Check if logged in - wait for user to log in if needed
        current_url = page.url
        print(f"  当前页面: {current_url}", file=sys.stderr)

        if "login" in current_url.lower() or "i/flow" in current_url.lower() or "compose/articles" not in current_url.lower():
            print("\n  ⚠️  需要先登录 X！请在打开的浏览器中登录你的账号。", file=sys.stderr)
            print("  登录完成后，手动打开 https://x.com/compose/articles", file=sys.stderr)
            print("  然后回到这里按 Enter 继续...", file=sys.stderr)
            input()
            # Refresh current page state
            page = browser.pages[-1] if browser.pages else browser.new_page()
            current_url = page.url
            if "compose/articles" not in current_url:
                page.goto("https://x.com/compose/articles", wait_until="domcontentloaded", timeout=60000)
                time.sleep(5)

        # Wait for editor to be ready
        print("  等待编辑器加载...", file=sys.stderr)
        time.sleep(3)

        # Take screenshot for debugging
        page.screenshot(path="/tmp/wx2x_debug.png")
        print("  截图已保存: /tmp/wx2x_debug.png", file=sys.stderr)

        # Click "Create" if needed
        try:
            create_btn = page.locator('text="Create"').or_(page.locator('text="创建"')).or_(page.locator('[data-testid="createButton"]'))
            if create_btn.count() > 0:
                create_btn.first.click()
                time.sleep(3)
                print("  点击了创建按钮", file=sys.stderr)
        except:
            pass

        # Fill title - try multiple selectors
        print("  📌 填入标题...", file=sys.stderr)
        title_filled = False
        for selector in ['[placeholder="Title"]', '[placeholder="添加标题"]', '[data-testid="editor-title"]',
                         '[data-testid="articleTitleTextarea"]', 'textarea', '[contenteditable="true"]']:
            try:
                el = page.locator(selector).first
                if el.is_visible(timeout=2000):
                    el.click()
                    el.fill(title)
                    title_filled = True
                    print(f"  标题已填入 (via {selector})", file=sys.stderr)
                    break
            except:
                continue

        if not title_filled:
            print("  ⚠️ 未找到标题输入框，请手动填入标题", file=sys.stderr)

        # Paste HTML content
        print("  📋 粘贴文章内容...", file=sys.stderr)
        copy_html_to_clipboard_mac(html)
        time.sleep(1)

        # Find and click editor body - try multiple approaches
        editor_clicked = False
        for selector in ['[data-testid="composer"]', '[data-testid="articleBodyTextarea"]',
                         '[role="textbox"]', '[contenteditable="true"]']:
            try:
                els = page.locator(selector)
                # Use last match (body editor, not title)
                el = els.last if els.count() > 1 else els.first
                if el.is_visible(timeout=2000):
                    el.click()
                    editor_clicked = True
                    print(f"  编辑器已定位 (via {selector})", file=sys.stderr)
                    break
            except:
                continue

        if not editor_clicked:
            print("  ⚠️ 未找到编辑器，请手动点击编辑器区域后按 Enter...", file=sys.stderr)
            input()

        # Paste
        page.keyboard.press("Meta+v")
        print("  内容已粘贴", file=sys.stderr)
        time.sleep(3)

        # Insert images (reverse order to maintain positions)
        if images:
            print(f"  🖼️  插入 {len(images)} 张图片...", file=sys.stderr)
            for img in reversed(images):
                idx = img["index"]
                path = img["path"]
                marker = f"@@@IMG_{idx}@@@"

                print(f"    图片 {idx}: {os.path.basename(path)}", file=sys.stderr)

                # Copy image to clipboard
                copy_image_to_clipboard_mac(path)
                time.sleep(0.5)

                # Find and select the marker text in editor
                found = page.evaluate(f'''() => {{
                    const composer = document.querySelector('[data-testid="composer"]') ||
                                     document.querySelector('[contenteditable="true"]');
                    if (!composer) return false;
                    const walker = document.createTreeWalker(composer, NodeFilter.SHOW_TEXT);
                    while (walker.nextNode()) {{
                        const text = walker.currentNode.textContent;
                        const match = text.match(/{re.escape(marker)}/);
                        if (match) {{
                            const range = document.createRange();
                            range.setStart(walker.currentNode, match.index);
                            range.setEnd(walker.currentNode, match.index + {len(marker)});
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                            return true;
                        }}
                    }}
                    return false;
                }}''')

                if found:
                    # Delete placeholder first, then paste image
                    page.keyboard.press("Backspace")
                    time.sleep(0.3)
                    page.keyboard.press("Meta+v")
                    time.sleep(2)

                    # Wait for upload
                    try:
                        page.wait_for_selector('text="正在上传媒体"', state="hidden", timeout=10000)
                    except:
                        time.sleep(2)
                else:
                    print(f"    ⚠️  未找到占位符 {marker}", file=sys.stderr)

        print("\n  ✅ 文章已导入 X Articles 编辑器！", file=sys.stderr)
        print("  请在浏览器中检查内容，确认无误后手动发布。", file=sys.stderr)
        print("  按 Enter 关闭浏览器...", file=sys.stderr)
        input()

        browser.close()


def main():
    parser = argparse.ArgumentParser(description="公众号文章 → X Articles 一键发布")
    parser.add_argument("source", help="公众号文章 URL 或本地 Markdown 文件")
    parser.add_argument("--no-publish", action="store_true", help="只解析不发布（输出 HTML）")
    parser.add_argument("--img-dir", default="/tmp/wx2x_images", help="图片下载目录")
    args = parser.parse_args()

    source = args.source
    img_dir = args.img_dir

    # Determine source type
    if source.startswith("http"):
        print(f"🔗 获取公众号文章: {source}", file=sys.stderr)
        html = fetch_wx_article(source)
        data = parse_wx_html(html)
    else:
        print(f"📄 读取本地文件: {source}", file=sys.stderr)
        with open(source, 'r', encoding='utf-8') as f:
            content = f.read()
        # Simple markdown to html (basic)
        data = {"title": Path(source).stem, "html": content, "images": []}

    title = data["title"]
    print(f"📰 标题: {title}", file=sys.stderr)
    print(f"🖼️  图片: {len(data['images'])} 张", file=sys.stderr)

    # Convert to clean X Articles HTML
    print("🔄 转换为 X Articles 格式...", file=sys.stderr)
    clean_html, downloaded_images = html_to_clean_x_html(
        data["html"], title, data["images"], img_dir
    )

    if args.no_publish:
        # Just output
        print(clean_html)
        print(f"\n图片已下载到: {img_dir}", file=sys.stderr)
        return

    # Publish via Playwright
    publish_to_x(title, clean_html, downloaded_images)


if __name__ == "__main__":
    main()
