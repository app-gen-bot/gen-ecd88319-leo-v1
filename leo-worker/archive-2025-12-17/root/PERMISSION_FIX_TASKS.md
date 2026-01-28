# Permission Fix Implementation - Restart Tasks

## Context
We've been working on fixing Docker bind mount permission issues between the app-factory (host) and Happy Llama container. The core problem is that the app-factory creates files as `ec2-user:ec2-user` (UID 1000:GID 1000) with 644/755 permissions, but the Happy Llama container runs as `llama` (UID 1001) in the `appbuilders` group (GID 1500) and can't modify these files.

## What We've Done So Far

### ✅ Completed Changes
1. **Enhanced `main.py`** with permission utilities:
   - Added `fix_workspace_permissions()` function
   - Added `safe_write_file()` function  
   - Set umask to 002 for group-writable files by default
   - These changes are already committed

2. **Modified `frontend_init.py`** with integrated permission fix:
   - Added `import os` and `import subprocess`
   - Enhanced `extract_template()` method to fix permissions immediately after extraction
   - Fixes applied right after `tar.extractall()` on line 60
   - **THIS IS THE KEY FIX** - permissions corrected at the source

### ✅ Permission Fix Logic (in extract_template method)
```python
# Fix permissions immediately after extraction  
logger.info(f"🔧 Fixing permissions for extracted template in {project_path}")
try:
    # Set umask for this process
    old_umask = os.umask(0o002)
    
    # Change group ownership to appbuilders (GID 1500)
    subprocess.run(['chgrp', '-R', '1500', str(project_path)], check=True)
    
    # Set directories to 2775 (rwxrwsr-x) - setgid ensures new files inherit group
    subprocess.run(['find', str(project_path), '-type', 'd', '-exec', 'chmod', '2775', '{}', '+'], check=True)
    
    # Set files to 664 (rw-rw-r--) - group writable  
    subprocess.run(['find', str(project_path), '-type', 'f', '-exec', 'chmod', '664', '{}', '+'], check=True)
    
    # Restore umask
    os.umask(old_umask)
    
    logger.info(f"✅ Fixed permissions for workspace: {project_path}")
except subprocess.CalledProcessError as e:
    logger.warning(f"⚠️ Warning: Could not fix all permissions: {e}")
    # Don't fail the extraction, just warn
```

## ❌ What Still Needs Testing

### Critical Tasks After Shell Restart:

#### 1. **Verify Syntax and Import Correctness**
```bash
cd /home/ec2-user/LEAPFROG/app-factory
python3 -m py_compile src/app_factory/initialization/frontend/frontend_init.py
```

#### 2. **Test Template Extraction with Permission Fix**
Run this test script (already created at `/tmp/test_permissions.py`):
```bash
cd /home/ec2-user/LEAPFROG/app-factory
PYTHONPATH=src python3 /tmp/test_permissions.py
```

#### 3. **Manual Verification Test**
If the Python test fails, do manual verification:
```bash
# Create test directory
rm -rf /tmp/test-extract && mkdir -p /tmp/test-extract && cd /tmp/test-extract

# Extract template normally (should have wrong permissions)
tar -xzf /home/ec2-user/.mcp-tools/templates/nextjs-shadcn-template-v1.3.0.tar.gz
echo "BEFORE fix:"
ls -la | head -5

# Apply the same fixes as our code
chgrp -R 1500 .
find . -type d -exec chmod 2775 {} +
find . -type f -exec chmod 664 {} +

echo "AFTER fix:"
ls -la | head -5
echo "package.json permissions:"
ls -la package.json
echo "app/ directory permissions:"  
ls -ld app/
```

#### 4. **Expected Success Results**
After running the fix, you should see:
```bash
# Files should show:
-rw-rw-r-- 1 ec2-user appbuilders 1490 package.json

# Directories should show:
drwxrwsr-x 2 ec2-user appbuilders 60 app/

# Key indicators:
# - Group is 'appbuilders' (not 'ec2-user')
# - Files are 664 (group writable)
# - Directories are 2775 (setgid bit 's' present)
```

#### 5. **Integration Test with Happy Llama**
After confirming the permission fix works:
1. Create a new workspace through Happy Llama
2. Check if the Docker container can now modify files
3. Look for the permission fix log messages:
   ```
   🔧 Fixing permissions for extracted template in /path
   ✅ Fixed permissions for workspace: /path
   ```

## Files Modified
- ✅ `src/app_factory/main.py` - Added permission utilities
- ✅ `src/app_factory/utils.py` - Set umask  
- ✅ `src/app_factory/stages/stage_2_wireframe.py` - Fixed async error handling
- ✅ `src/app_factory/initialization/frontend/frontend_init.py` - **KEY FIX** - Integrated permission fix

## Troubleshooting

### If Python Import Fails:
- Check syntax errors in frontend_init.py
- Ensure proper indentation  
- Verify all imports are correct

### If Permission Fix Doesn't Work:
- Check if ec2-user is member of appbuilders group: `groups ec2-user`
- Check if GID 1500 exists: `getent group 1500`
- Verify template extraction location is correct

### If Happy Llama Still Has Issues:
- Check Docker container user: `docker exec <container> id`
- Verify container user is member of appbuilders: `docker exec <container> groups`
- Check bind mount permissions: `docker inspect <container> | grep -i bind`

## Success Criteria
✅ **Template extraction creates files with:**
- Group: `appbuilders` (GID 1500)
- Files: 664 permissions (rw-rw-r--)  
- Directories: 2775 permissions (rwxrwsr-x)

✅ **Happy Llama Docker container can:**
- Read all extracted files
- Write to extracted files  
- Create new files in directories
- Run `npm install` and build processes successfully

## Next Steps After Testing
1. If tests pass, commit the changes
2. Test with a real Happy Llama workspace creation
3. Monitor logs for permission fix messages
4. Document the solution for future reference