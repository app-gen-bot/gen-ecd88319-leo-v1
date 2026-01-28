import os
os.environ['ALLOWED_ORIGINS'] = 'http://localhost:3000,http://localhost:3001,http://localhost:3095'

try:
    from config import settings
    print("Config loaded successfully!")
    print(f"Allowed origins: {settings.allowed_origins}")
    print(f"Type: {type(settings.allowed_origins)}")
except Exception as e:
    print(f"Error loading config: {e}")
    import traceback
    traceback.print_exc()