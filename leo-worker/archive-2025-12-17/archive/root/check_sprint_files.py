#!/usr/bin/env python3
"""Check where sprint files might be getting created."""

from pathlib import Path

print("🔍 Searching for sprint-related files...")
print("="*60)

# Possible locations to check
locations = [
    Path("."),  # Current directory
    Path("test_output"),
    Path("apps"),
    Path("src"),
]

# Patterns to search for
patterns = [
    "*sprint*.md",
    "*roadmap*.md",
    "prd_sprint_*.md"
]

found_files = []

for location in locations:
    if location.exists():
        print(f"\n📁 Checking {location}...")
        for pattern in patterns:
            files = list(location.rglob(pattern))
            for file in files:
                # Get relative path for display
                try:
                    rel_path = file.relative_to(Path.cwd())
                except ValueError:
                    rel_path = file
                
                # Get file info
                size = file.stat().st_size
                mtime = file.stat().st_mtime
                
                found_files.append((rel_path, size, mtime))
                print(f"   ✅ {rel_path} ({size:,} bytes)")

if not found_files:
    print("\n❌ No sprint-related files found!")
else:
    print(f"\n📊 Total files found: {len(found_files)}")
    
    # Sort by modification time and show recent ones
    found_files.sort(key=lambda x: x[2], reverse=True)
    print("\n🕐 Most recently modified:")
    from datetime import datetime
    for path, size, mtime in found_files[:10]:
        dt = datetime.fromtimestamp(mtime)
        print(f"   {dt.strftime('%Y-%m-%d %H:%M:%S')} - {path}")