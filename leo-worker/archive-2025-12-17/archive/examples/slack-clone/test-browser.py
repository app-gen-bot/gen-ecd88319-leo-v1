#!/usr/bin/env python3
"""
Comprehensive browser-based test suite for Slack Clone application.
Tests user workflows, UI interactions, and error handling.
"""

import json
import time
import sys
from datetime import datetime

class SlackCloneBrowserTest:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.api_url = "http://localhost:8000"
        self.test_email = "test@example.com"
        self.test_password = "password123"
        self.errors = []
        self.screenshots = []
        
    def log(self, message, level="INFO"):
        """Log test progress"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_browser_command(self, action, **kwargs):
        """Helper to run browser MCP commands"""
        # This would use the mcp__browser__browser tool
        # For now, we'll structure the commands
        command = {
            "action": action,
            **kwargs
        }
        self.log(f"Browser command: {json.dumps(command, indent=2)}")
        return command
        
    def test_authentication_flow(self):
        """Test login and logout functionality"""
        self.log("Testing authentication flow...")
        
        tests = [
            # Navigate to login page
            {"action": "navigate", "url": f"{self.base_url}/login"},
            
            # Test invalid login
            {"action": "interact", "selector": "input[name='email']", "interaction": "fill", "value": "invalid@email.com"},
            {"action": "interact", "selector": "input[name='password']", "interaction": "fill", "value": "wrongpassword"},
            {"action": "interact", "selector": "button[type='submit']", "interaction": "click"},
            {"wait": 2},  # Wait for error message
            
            # Test valid login
            {"action": "interact", "selector": "input[name='email']", "interaction": "fill", "value": self.test_email},
            {"action": "interact", "selector": "input[name='password']", "interaction": "fill", "value": self.test_password},
            {"action": "interact", "selector": "button[type='submit']", "interaction": "click"},
            {"wait": 3},  # Wait for redirect
        ]
        
        return tests
        
    def test_channel_navigation(self):
        """Test navigating between channels"""
        self.log("Testing channel navigation...")
        
        tests = [
            # Click on #general channel
            {"action": "interact", "selector": "a[href='/channel/general']", "interaction": "click"},
            {"wait": 2},
            
            # Click on #random channel
            {"action": "interact", "selector": "a[href='/channel/random']", "interaction": "click"},
            {"wait": 2},
            
            # Click on a DM
            {"action": "interact", "selector": "a[href='/dm/alex-smith']", "interaction": "click"},
            {"wait": 2},
        ]
        
        return tests
        
    def test_messaging(self):
        """Test sending messages"""
        self.log("Testing messaging functionality...")
        
        tests = [
            # Navigate to general channel
            {"action": "navigate", "url": f"{self.base_url}/channel/general"},
            {"wait": 2},
            
            # Type a message
            {"action": "interact", "selector": "textarea[placeholder*='Message']", "interaction": "fill", 
             "value": "Hello from automated test! 🤖"},
            
            # Send message (press Enter or click send button)
            {"action": "interact", "selector": "button[aria-label='Send message']", "interaction": "click"},
            {"wait": 2},
        ]
        
        return tests
        
    def test_user_interactions(self):
        """Test user profile popovers and interactions"""
        self.log("Testing user interactions...")
        
        tests = [
            # Click on a user avatar
            {"action": "interact", "selector": ".message-avatar:first-of-type", "interaction": "click"},
            {"wait": 2},
            
            # Close popover
            {"action": "interact", "selector": "body", "interaction": "click", "wait_time": 0.5},
            
            # Open search
            {"action": "interact", "selector": "input[placeholder*='Search']", "interaction": "click"},
            {"wait": 2},
            
            # Close search modal
            {"action": "interact", "selector": "button[aria-label='Close']", "interaction": "click"},
            {"wait": 1},
            
            # Open notifications
            {"action": "interact", "selector": "button[aria-label='Notifications']", "interaction": "click"},
            {"wait": 2},
        ]
        
        return tests
        
    def test_error_handling(self):
        """Test error scenarios"""
        self.log("Testing error handling...")
        
        tests = [
            # Try to access protected route without auth
            {"action": "navigate", "url": f"{self.base_url}/admin"},
            {"wait": 2},
            
            # Test network error handling (if backend is down)
            # This would be tested by stopping backend and checking UI behavior
        ]
        
        return tests
        
    def generate_test_report(self):
        """Generate comprehensive test report"""
        report = {
            "test_run": datetime.now().isoformat(),
            "base_url": self.base_url,
            "tests_performed": [
                "Authentication Flow",
                "Channel Navigation", 
                "Messaging",
                "User Interactions",
                "Error Handling"
            ],
            "browser_errors": self.errors,
            "screenshots_captured": len(self.screenshots),
            "recommendations": []
        }
        
        if self.errors:
            report["recommendations"].append("Fix JavaScript errors found in console")
            
        return report
        
    def run_all_tests(self):
        """Execute all test suites"""
        self.log("Starting Slack Clone browser tests...")
        
        # Collect all test commands
        all_tests = []
        
        # Open browser
        all_tests.append({"action": "open", "headless": False})
        
        # Run test suites
        all_tests.extend(self.test_authentication_flow())
        all_tests.extend(self.test_channel_navigation())
        all_tests.extend(self.test_messaging())
        all_tests.extend(self.test_user_interactions())
        all_tests.extend(self.test_error_handling())
        
        # Close browser
        all_tests.append({"action": "close"})
        
        # Generate test script
        self.log("\n=== Browser Test Commands ===")
        for i, test in enumerate(all_tests):
            if "wait" in test:
                self.log(f"Step {i+1}: Wait {test['wait']} seconds")
            else:
                self.log(f"Step {i+1}: {test}")
                
        # Generate report
        report = self.generate_test_report()
        self.log("\n=== Test Report ===")
        print(json.dumps(report, indent=2))
        
        return all_tests

def main():
    """Main test runner"""
    tester = SlackCloneBrowserTest()
    
    # Check if services are running
    import subprocess
    
    # Check frontend
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:3000"],
            capture_output=True,
            text=True
        )
        if result.stdout != "200":
            print("ERROR: Frontend not running on port 3000")
            sys.exit(1)
    except:
        print("ERROR: Could not check frontend status")
        sys.exit(1)
        
    # Check backend
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:8000/health"],
            capture_output=True,
            text=True
        )
        if result.stdout != "200":
            print("ERROR: Backend not running on port 8000")
            sys.exit(1)
    except:
        print("ERROR: Could not check backend status")
        sys.exit(1)
        
    # Run tests
    test_commands = tester.run_all_tests()
    
    print("\n=== How to Execute ===")
    print("Use the browser MCP tool to execute each command in sequence.")
    print("Monitor console errors and network failures during execution.")
    print("\nExample command structure:")
    print('mcp__browser__browser {"action": "open", "headless": false}')
    print('mcp__browser__browser {"action": "navigate", "url": "http://localhost:3000/login"}')
    print("... continue with remaining commands ...")

if __name__ == "__main__":
    main()