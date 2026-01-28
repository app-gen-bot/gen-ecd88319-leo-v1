#!/usr/bin/env python3
"""
Extract the TodoSync app HTML from the captured Replit preview HTML.
The app is embedded in an iframe's srcdoc attribute and needs to be decoded.
"""

import re
import html

def extract_todo_app():
    # Read the captured HTML
    with open('possible-app-preview.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the srcdoc attribute containing the TodoSync app
    srcdoc_pattern = r'srcdoc="([^"]*)"'
    match = re.search(srcdoc_pattern, content)
    
    if not match:
        print("❌ Could not find srcdoc attribute")
        return
    
    # Extract and decode the HTML
    encoded_html = match.group(1)
    decoded_html = html.unescape(encoded_html)
    
    # Clean up and format the HTML
    # The decoded HTML should start with <html lang="en">
    if not decoded_html.strip().startswith('<html'):
        print("❌ Decoded content doesn't start with HTML tag")
        print(f"First 100 chars: {decoded_html[:100]}")
        return
    
    # Save the clean TodoSync app HTML
    with open('todo-app-preview.html', 'w', encoding='utf-8') as f:
        f.write(decoded_html)
    
    print("✅ TodoSync app extracted successfully!")
    print(f"📁 Saved to: todo-app-preview.html")
    print(f"📊 Size: {len(decoded_html)} characters")
    
    # Show first few lines to verify
    lines = decoded_html.split('\n')[:10]
    print("\n🎯 First 10 lines:")
    for i, line in enumerate(lines, 1):
        print(f"  {i:2}: {line[:80]}")

if __name__ == "__main__":
    extract_todo_app()