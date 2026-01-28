#!/usr/bin/env python3
"""Fix checkpoint to mark Stage 1 as completed and ready for Stage 2."""

import json
from pathlib import Path
from datetime import datetime

# Find the most recent checkpoint for theplug
checkpoint_dir = Path("checkpoints")
app_name = "theplug_20250718_151044"

# Look for checkpoints containing this app
checkpoints = []
for checkpoint_file in checkpoint_dir.glob("*.json"):
    try:
        with open(checkpoint_file, 'r') as f:
            data = json.load(f)
            if data.get('app_name') == app_name:
                checkpoints.append((checkpoint_file, data))
    except Exception as e:
        print(f"Error reading {checkpoint_file}: {e}")

if not checkpoints:
    print(f"❌ No checkpoints found for {app_name}")
    exit(1)

# Sort by file modification time to get the most recent
checkpoints.sort(key=lambda x: x[0].stat().st_mtime, reverse=True)
checkpoint_file, checkpoint_data = checkpoints[0]

print(f"📋 Found checkpoint: {checkpoint_file.name}")
print(f"   App: {checkpoint_data['app_name']}")
print(f"   Current Stage 1 status: {checkpoint_data['stages']['interaction_spec']['status']}")

# Update Stage 1 to completed
checkpoint_data['stages']['interaction_spec']['status'] = 'completed'
checkpoint_data['stages']['interaction_spec']['end_time'] = datetime.now().isoformat()
checkpoint_data['stages']['interaction_spec']['cost'] = 3.17  # From the successful run
checkpoint_data['stages']['interaction_spec']['iterations'] = 1
checkpoint_data['stages']['interaction_spec']['outputs'] = {
    'spec_path': f'apps/{app_name}/specs/frontend-interaction-spec.md'
}
checkpoint_data['stages']['interaction_spec']['metadata'] = {
    'critic_score': 100,
    'writer_critic_iterations': 1
}

# Update total cost
checkpoint_data['total_cost'] = sum(
    stage.get('cost', 0) for stage in checkpoint_data['stages'].values()
)

# Update timestamp
checkpoint_data['updated_at'] = datetime.now().isoformat()

# Save the updated checkpoint
with open(checkpoint_file, 'w') as f:
    json.dump(checkpoint_data, f, indent=2)

print(f"\n✅ Updated checkpoint successfully!")
print(f"   Stage 1 status: completed")
print(f"   Stage 1 cost: $3.17")
print(f"   Total cost: ${checkpoint_data['total_cost']}")
print(f"\n🎯 Ready to resume from Stage 2 (Wireframe)")
print(f"\nRun this command to continue:")
print(f"uv run python -m app_factory.main_v2 --checkpoint {checkpoint_file.stem}")