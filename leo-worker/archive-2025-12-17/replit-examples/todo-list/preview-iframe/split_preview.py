#!/usr/bin/env python3
"""
Split the possible-app-preview.html into two parts:
1. streaming-system.html - The SSE/EventSource infrastructure (Replit IDE wrapper)
2. todo-app-preview.html - The actual TodoSync app HTML (extracted from iframe)

Note: This script now properly separates the Replit IDE wrapper from the embedded TodoSync app.
"""

import re
import html

def split_preview():
    print("🔍 Reading possible-app-preview.html...")
    
    # Read the captured HTML
    with open('possible-app-preview.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the iframe with srcdoc containing the TodoSync app
    iframe_pattern = r'<iframe[^>]*srcdoc="([^"]*)"[^>]*>'
    iframe_match = re.search(iframe_pattern, content)
    
    if not iframe_match:
        print("❌ Could not find iframe with TodoSync app")
        return
    
    # Extract the TodoSync app HTML from srcdoc
    encoded_html = iframe_match.group(1)
    todo_app_html = html.unescape(encoded_html)
    
    # Find the boundary - everything before the iframe is Replit IDE
    iframe_start = iframe_match.start()
    streaming_system = content[:iframe_start] + """
<!-- TodoSync app would be embedded here in an iframe -->
<div class="app-placeholder">
    <p>TodoSync App Preview</p>
    <p>The actual app HTML has been extracted to todo-app-preview.html</p>
</div>
""" + content[iframe_match.end():]
    
    # Write the separated files
    with open('streaming-system.html', 'w', encoding='utf-8') as f:
        f.write(streaming_system)
    
    with open('todo-app-preview.html', 'w', encoding='utf-8') as f:
        f.write(todo_app_html)
    
    print("✅ Split complete!")
    print(f"📁 streaming-system.html: {len(streaming_system)} chars (Replit IDE wrapper)")
    print(f"📁 todo-app-preview.html: {len(todo_app_html)} chars (TodoSync app)")
    
    # Show first few lines of TodoSync app
    app_lines = todo_app_html.split('\n')[:10]
    print("\n🎯 First 10 lines of TodoSync app:")
    for i, line in enumerate(app_lines, 1):
        print(f"  {i:2}: {line[:80]}")

if __name__ == "__main__":
    split_preview()