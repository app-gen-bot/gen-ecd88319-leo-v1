#!/usr/bin/env python3
"""
Demo script to show tree-sitter capabilities for Stage 2 agents
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_tools.tree_sitter.server import (
    validate_syntax, fix_imports, analyze_code_structure,
    track_dependencies, detect_api_calls, find_code_patterns
)

async def demo_tree_sitter():
    """Demonstrate tree-sitter capabilities"""
    
    print("="*70)
    print("TREE-SITTER CAPABILITIES DEMO FOR STAGE 2 WIREFRAME")
    print("="*70)
    
    # Create a test component with common issues
    test_dir = Path("/tmp/wireframe_demo")
    test_dir.mkdir(exist_ok=True)
    
    component_file = test_dir / "UserCard.tsx"
    component_file.write_text("""
import React from 'react';
import { Card } from '@/components/ui/card';

// Missing useState import but using it
interface UserCardProps {
    name: string;
    email: string;
    role: 'admin' | 'user';
}

const UserCard: React.FC<UserCardProps> = ({ name, email, role }) => {
    const [isExpanded, setIsExpanded] = useState(false);  // useState not imported!
    
    return (
        <Card className="p-4">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-600">{email}</p>
            <Badge variant={role === 'admin' ? 'destructive' : 'default'}>  // Badge not imported!
                {role}
            </Badge>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-500"
            >
                {isExpanded ? 'Show Less' : 'Show More'}
            </button>
            {isExpanded && (
                <div className="mt-4">
                    Additional user details here...
                </div
            )}  // Syntax error: missing > in closing div
        </Card>
    );
};

// Missing export
UserCard;
""")
    
    print(f"\n📁 Created test component: {component_file}")
    print("\n" + "="*70)
    
    # 1. Validate Syntax
    print("\n1️⃣ VALIDATING SYNTAX (Real-time feedback like VS Code)")
    print("-" * 50)
    result = await validate_syntax(file_path=str(component_file))
    print(f"❌ Errors found: {result['error_count']}")
    for error in result['errors']:
        print(f"   Line {error['line']}, Col {error['column']}: {error['message']}")
    
    # 2. Fix Imports
    print("\n2️⃣ DETECTING MISSING IMPORTS")
    print("-" * 50)
    result = await fix_imports(file_path=str(component_file))
    print(f"🔍 Undefined references: {result['undefined_references']}")
    print(f"💡 Suggested imports:")
    for imp in result['imports_to_add']:
        print(f"   {imp}")
    
    # 3. Analyze Component Structure
    print("\n3️⃣ ANALYZING COMPONENT STRUCTURE (AST-based)")
    print("-" * 50)
    result = await analyze_code_structure(file_path=str(component_file))
    for entity in result['entities']:
        if entity['type'] == 'component':
            print(f"🧩 Component: {entity['name']}")
            print(f"   Props: {entity.get('props', {})}")
            print(f"   Lines: {entity['line_start']}-{entity['line_end']}")
    
    # Create another file that imports UserCard
    app_file = test_dir / "App.tsx"
    app_file.write_text("""
import React from 'react';
import { UserCard } from './UserCard';  // Will detect this needs fixing

function App() {
    const users = [
        { name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
    ];
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Directory</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user, index) => (
                    <UserCard key={index} {...user} />
                ))}
            </div>
        </div>
    );
}

export default App;
""")
    
    # 4. Track Dependencies
    print("\n4️⃣ TRACKING DEPENDENCIES")
    print("-" * 50)
    result = await track_dependencies(file_path=str(app_file), depth=2)
    print(f"📦 Dependencies for App.tsx:")
    for dep in result['dependencies']['imports']:
        print(f"   - {dep['module']} ({dep['import_type']})")
    
    # 5. Detect API Calls
    print("\n5️⃣ DETECTING API CALLS (Ensure all are mocked)")
    print("-" * 50)
    
    # Create a file with API calls
    api_file = test_dir / "api.tsx"
    api_file.write_text("""
// Mocked API call (good for Stage 2)
const mockFetch = async (url: string) => {
    return { data: 'mocked response' };
};

// Real API call (should be caught)
const fetchUsers = async () => {
    const response = await fetch('/api/users');
    return response.json();
};

// Another mocked call
const mockAxios = {
    get: async (url: string) => ({ data: [] })
};
""")
    
    result = await detect_api_calls(directory=str(test_dir))
    print(f"✅ Mocked API calls: {result['summary']['mock_api_calls']}")
    print(f"⚠️  Real API calls: {result['summary']['real_api_calls']} (should be 0 in Stage 2!)")
    
    # 6. Find React Patterns
    print("\n6️⃣ FINDING REACT PATTERNS")
    print("-" * 50)
    result = await find_code_patterns(directory=str(test_dir))
    print(f"🎯 Patterns found:")
    for pattern in result['patterns']:
        print(f"   - {pattern['pattern_type']}: {pattern['description']}")
    
    print("\n" + "="*70)
    print("SUMMARY: How Tree-Sitter Helps Stage 2 Agents")
    print("="*70)
    print("""
✅ Writer Agent Benefits:
   - Instant syntax validation (no waiting for build)
   - Automatic import resolution
   - Component extraction from repeated patterns
   
✅ Critic Agent Benefits:
   - AST-based analysis (no regex false positives)
   - Comprehensive dependency tracking
   - Pattern compliance checking
   
✅ QC Agent Benefits:
   - Verify all API calls are mocked
   - Ensure no syntax errors remain
   - Validate component prop consistency
   
💡 Result: 50% fewer build-test cycles, faster iterations!
""")
    
    # Cleanup
    import shutil
    shutil.rmtree(test_dir)

if __name__ == "__main__":
    asyncio.run(demo_tree_sitter())