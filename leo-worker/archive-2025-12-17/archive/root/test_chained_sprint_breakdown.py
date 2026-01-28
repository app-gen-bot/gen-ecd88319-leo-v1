#!/usr/bin/env python3
"""Test the new chained sprint breakdown approach."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown_chained

async def test_simple_prd():
    """Test with a simple PRD."""
    print("\n" + "="*60)
    print("🧪 TEST 1: Simple PRD (should create 3 sprints)")
    print("="*60)
    
    simple_prd = """# Simple Task Manager PRD

## Overview
A task management application for small teams.

## Core Features
1. User authentication (login/logout)
2. Create, read, update, delete tasks
3. Assign tasks to team members
4. Set task priorities (high, medium, low)
5. Add due dates to tasks
6. Mark tasks as complete
7. Filter tasks by status/assignee
8. Add comments to tasks
9. Search tasks
10. Basic reporting dashboard"""

    output_dir = Path("test_output/chained_simple")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    result, sprint_paths = await stage_0_5_sprint_breakdown_chained.run_stage(
        prd_content=simple_prd,
        app_name="simple-task-manager",
        output_dir=output_dir
    )
    
    print(f"\n✅ Success: {result.success}")
    print(f"💰 Total cost: ${result.cost:.4f}")
    print(f"📋 Sprints created: {len(sprint_paths)}")
    
    # Check all expected files
    files_to_check = [
        "sprint_overview.md",
        "sprint_roadmap.md",
        "prd_sprint_1.md",
        "prd_sprint_2.md",
        "prd_sprint_3.md"
    ]
    
    for filename in files_to_check:
        filepath = output_dir / filename
        if filepath.exists():
            print(f"   ✅ {filename} ({filepath.stat().st_size:,} bytes)")
        else:
            print(f"   ❌ {filename} - MISSING")


async def test_complex_prd():
    """Test with a complex PRD that might need more sprints."""
    print("\n" + "="*60)
    print("🧪 TEST 2: Complex PRD (might create 4-6 sprints)")
    print("="*60)
    
    complex_prd = """# Enterprise Resource Planning (ERP) System PRD

## Overview
Comprehensive ERP system for medium-sized manufacturing companies.

## Core Features

### Manufacturing Management
1. Production planning and scheduling
2. Bill of Materials (BOM) management
3. Work order management
4. Quality control and inspection
5. Machine maintenance scheduling
6. Production cost tracking
7. Real-time production monitoring

### Inventory Management
8. Multi-warehouse inventory tracking
9. Automated reorder points
10. Barcode/QR code scanning
11. Inventory valuation methods
12. Stock transfer management
13. Expiry date tracking
14. Inventory forecasting

### Supply Chain Management
15. Vendor management
16. Purchase order automation
17. RFQ management
18. Supplier performance tracking
19. Multi-currency support
20. Import/export documentation
21. Logistics tracking

### Financial Management
22. General ledger
23. Accounts payable/receivable
24. Multi-currency transactions
25. Bank reconciliation
26. Financial reporting
27. Budget management
28. Cost center accounting

### Human Resources
29. Employee database
30. Payroll processing
31. Time and attendance
32. Leave management
33. Performance reviews
34. Training management
35. Recruitment tracking

### Customer Relationship Management
36. Customer database
37. Sales pipeline management
38. Quote generation
39. Contract management
40. Customer support ticketing
41. Customer portal
42. Sales analytics

### Business Intelligence
43. Real-time dashboards
44. Custom report builder
45. KPI tracking
46. Predictive analytics
47. Data visualization
48. Export capabilities
49. Mobile analytics app

### System Features
50. Role-based access control
51. Multi-language support
52. API for integrations
53. Audit trails
54. Document management
55. Workflow automation
56. Notification system"""

    output_dir = Path("test_output/chained_complex")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    result, sprint_paths = await stage_0_5_sprint_breakdown_chained.run_stage(
        prd_content=complex_prd,
        app_name="enterprise-erp",
        output_dir=output_dir
    )
    
    print(f"\n✅ Success: {result.success}")
    print(f"💰 Total cost: ${result.cost:.4f}")
    print(f"📋 Sprints created: {len(sprint_paths)}")
    
    # List all created files
    for file in sorted(output_dir.glob("*.md")):
        print(f"   ✅ {file.name} ({file.stat().st_size:,} bytes)")


async def test_pawsflow():
    """Test with the PawsFlow PRD."""
    print("\n" + "="*60)
    print("🧪 TEST 3: PawsFlow PRD")
    print("="*60)
    
    # Read the actual PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    if not prd_path.exists():
        print("❌ PawsFlow PRD not found")
        return
    
    prd_content = prd_path.read_text()
    
    output_dir = Path("test_output/chained_pawsflow")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    result, sprint_paths = await stage_0_5_sprint_breakdown_chained.run_stage(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=output_dir
    )
    
    print(f"\n✅ Success: {result.success}")
    print(f"💰 Total cost: ${result.cost:.4f}")
    print(f"📋 Sprints created: {len(sprint_paths)}")
    
    # List all created files
    for file in sorted(output_dir.glob("*.md")):
        print(f"   ✅ {file.name} ({file.stat().st_size:,} bytes)")
    
    # Show a preview of Sprint 1 MVP
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 MVP Preview:")
        content = sprint1_path.read_text()
        lines = content.split('\n')
        for i, line in enumerate(lines[:30]):
            if line.strip():
                print(f"   {line}")
            if i == 29:
                print("   ...")


async def main():
    """Run all tests."""
    print("🚀 Testing Chained Sprint Breakdown")
    print("This approach creates files one at a time for reliability")
    
    await test_simple_prd()
    await test_complex_prd()
    await test_pawsflow()
    
    print("\n✅ All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())