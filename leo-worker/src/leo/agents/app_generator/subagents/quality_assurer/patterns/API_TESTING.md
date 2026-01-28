# API Testing with curl

**Purpose:** Systematic endpoint testing to verify all CRUD operations

---

## Complete CRUD Test Pattern

```bash
# Health check
curl http://localhost:5000/health

# Auth endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Save token
TOKEN="..." # from login response

# CREATE
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Item","description":"Test"}'

# READ (list)
curl http://localhost:5000/api/items \
  -H "Authorization: Bearer $TOKEN"

# READ (single)
curl http://localhost:5000/api/items/1 \
  -H "Authorization: Bearer $TOKEN"

# UPDATE
curl -X PUT http://localhost:5000/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Updated Item"}'

# DELETE
curl -X DELETE http://localhost:5000/api/items/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## For EVERY Entity

Test all 5 CRUD operations systematically. Document exact response codes and bodies.

---

## Why This Matters

API testing catches auth issues, validation errors, and database problems before frontend testing.
