# Routes.ts Generation Comparison

**Date**: 2025-10-12
**Purpose**: Compare current routes.ts generation with expected output after business logic inference prompts

## Current Routes.ts (Before Prompts)

### ✅ Good - Business Logic Already Present

The existing generator DID create some business logic APIs:

```typescript
// User lookup
GET /users/email/:email  // Find user by email

// Vendor filtering
GET /vendors/user/:userId  // Get vendor for a user
GET /vendors/filter/active  // Active vendors only
GET /vendors/filter/verified  // Verified vendors only

// Service filtering
GET /services/vendor/:vendorId  // Services for specific vendor
GET /services/category/:category  // Filter by category
GET /services/filter/available  // Available services only

// Portfolio filtering
GET /portfolios/vendor/:vendorId  // Portfolios for vendor
GET /portfolios/category/:category  // Filter by category
GET /portfolios/filter/published  // Published portfolios

// Messaging
GET /messages/conversation/:conversationId  // Conversation messages
GET /messages/sender/:senderId  // Messages from sender
GET /messages/receiver/:receiverId  // Messages to receiver
POST /messages/:id/read  // Mark message as read
```

**Analysis**: The generator inferred these from storage methods, showing some business logic awareness.

### ❌ Missing - User-Centric Business Logic

What's NOT present but should be based on the plan's user stories:

```typescript
// Current User APIs (Pattern: "Users can view THEIR...")
GET /users/me  // Current user's profile
GET /vendors/me  // Current user's vendor profile
GET /portfolios/me  // Current user's portfolios
GET /services/me  // Current user's services

// Message Conversations (Pattern: "Real-time messaging...")
GET /messages/conversations  // User's conversation list with last message
GET /messages/unread  // Unread message count
GET /messages/conversations/:userId  // Messages with specific user

// Vendor Search (Pattern: "Advanced vendor search with filters...")
GET /vendors/search  // Search with query params: ?category=X&priceMin=Y&location=Z
GET /services/search  // Search services with filters
```

## Expected Routes.ts (After New Prompts)

### What Our Inference Patterns Would Add

Based on plan.md user stories, the new prompts would teach the generator to add:

#### 1. Current User Pattern ("Users can view their profile...")
```typescript
// GET /users/me
router.get("/users/me", async (req, res) => {
  // TODO: Get userId from auth context when implemented
  // const userId = req.user?.id;
  const userId = "user-1"; // Mock for development

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});
```

#### 2. User's Vendor Profile Pattern ("Vendor profile creation...")
```typescript
// GET /vendors/me
router.get("/vendors/me", async (req, res) => {
  // TODO: Get userId from auth context
  const userId = "user-1"; // Mock for development

  try {
    const vendor = await storage.getVendorByUserId(userId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendor profile" });
  }
});
```

#### 3. Conversation List Pattern ("Real-time messaging system...")
```typescript
// GET /messages/conversations
router.get("/messages/conversations", async (req, res) => {
  // TODO: Get userId from auth context
  const userId = "user-1"; // Mock for development

  try {
    // Get all messages where user is sender or receiver
    const sent = await storage.getMessagesBySenderId(userId);
    const received = await storage.getMessagesByReceiverId(userId);

    // Group by conversation and get latest message
    const conversations = {}; // Implementation would group and sort

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});
```

#### 4. Search with Filters Pattern ("Advanced vendor search...")
```typescript
// GET /vendors/search?category=X&priceMin=Y&priceMax=Z&location=A
router.get("/vendors/search", async (req, res) => {
  try {
    let vendors = await storage.getActiveVendors();

    // Apply filters from query params
    if (req.query.category) {
      vendors = vendors.filter(v => v.category === req.query.category);
    }
    if (req.query.location) {
      vendors = vendors.filter(v => v.location?.includes(req.query.location as string));
    }
    // Additional price filtering would go here

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Failed to search vendors" });
  }
});
```

## Inference Pattern Mapping

### From Plan to APIs

**Plan says**: "Real-time messaging system with chat interface"
**Generator infers**:
- GET /messages/conversations (user's conversations)
- GET /messages/unread (unread count)
- GET /messages/conversations/:userId (messages with specific user)

**Plan says**: "Vendor profile creation with business details"
**Generator infers**:
- GET /vendors/me (current user's vendor profile)
- PATCH /vendors/me (update own vendor profile)

**Plan says**: "Advanced vendor search with filters by service type, price range, and location"
**Generator infers**:
- GET /vendors/search (with query parameters)
- Implements filtering logic for category, price, location

## Key Improvements

### 1. Plan-Aware Generation
- **Before**: Generator looked at storage methods only
- **After**: Generator reads plan user stories AND storage methods
- **Result**: Context-aware APIs matching business needs

### 2. /me Endpoint Pattern
- **Before**: Only GET /users/:id (requires knowing ID)
- **After**: GET /users/me (auth context provides ID)
- **Result**: Easier frontend integration, auth-aware

### 3. Search Endpoints
- **Before**: Only filter by specific fields (/vendors/category/:category)
- **After**: Combined search with multiple query params
- **Result**: More flexible, matches "advanced search" requirement

### 4. Conversation Management
- **Before**: Raw message endpoints only
- **After**: Conversation grouping, unread counts, user-specific views
- **Result**: Actually usable messaging system

## Mock Auth Pattern

All user-specific endpoints would include:

```typescript
// TODO: Get from auth context when implemented
// const userId = req.user?.id;
const userId = "user-1"; // Mock for development
```

This:
- ✅ Makes endpoints testable immediately
- ✅ Documents where auth integration is needed
- ✅ Works with localStorage token pattern for development
- ✅ Easy to replace with real auth later

## Validation

To validate the new prompts work, we need to:
1. ✅ Fix template extraction issue
2. ⏳ Regenerate timeless-weddings with new prompts
3. ⏳ Verify routes.ts contains /me endpoints
4. ⏳ Verify search endpoints with query params
5. ⏳ Verify conversation grouping logic

## Conclusion

The existing generator had SOME business logic awareness (from storage methods), but lacked user-centric patterns. Our new prompts teach it to:
- Read plan for user stories
- Infer /me endpoints from "users can view their..." patterns
- Infer search endpoints from "advanced search..." patterns
- Infer conversation grouping from "messaging system..." patterns
- Add mock auth with TODOs for future integration

**Impact**: Prevents Bug #12 (404 errors on /users/me, /bookings/upcoming, etc.)
