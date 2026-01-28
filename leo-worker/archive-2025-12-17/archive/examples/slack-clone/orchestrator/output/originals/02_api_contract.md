# API Contract - Slack Clone

## Base URL
`/api/v1`

## Authentication
All authenticated endpoints require:
- Header: `Authorization: Bearer <jwt_token>`
- JWT expires in 7 days

## Endpoints

### Authentication

#### POST /auth/register
Request:
```json
{
  "email": "string",
  "password": "string", 
  "name": "string"
}
```
Response: 201
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```
Errors: 400 (validation), 409 (email exists)

#### POST /auth/login
Request:
```json
{
  "email": "string",
  "password": "string"
}
```
Response: 200
```json
{
  "access_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "workspaces": [{"id": "string", "name": "string"}]
  }
}
```
Errors: 401 (invalid credentials)

#### GET /auth/google
Redirects to Google OAuth

#### GET /auth/google/callback
Query params: `code`, `state`
Response: Redirect with JWT in cookie

### Workspaces

#### POST /workspaces
Request:
```json
{
  "name": "string"
}
```
Response: 201
```json
{
  "id": "string",
  "name": "string",
  "owner_id": "string",
  "created_at": "datetime"
}
```

#### GET /workspaces/{workspace_id}
Response: 200
```json
{
  "id": "string",
  "name": "string", 
  "member_count": "number",
  "channel_count": "number",
  "role": "admin|member"
}
```

### Channels

#### GET /workspaces/{workspace_id}/channels
Response: 200
```json
{
  "channels": [
    {
      "id": "string",
      "name": "string",
      "is_private": "boolean",
      "member_count": "number",
      "unread_count": "number"
    }
  ]
}
```

#### POST /workspaces/{workspace_id}/channels
Request:
```json
{
  "name": "string",
  "is_private": "boolean"
}
```
Response: 201 (same as single channel)

#### GET /workspaces/{workspace_id}/channels/{channel_id}
Response: 200
```json
{
  "id": "string",
  "name": "string",
  "is_private": "boolean",
  "members": ["user_id"],
  "created_at": "datetime"
}
```

#### POST /workspaces/{workspace_id}/channels/{channel_id}/members
Request:
```json
{
  "user_id": "string"
}
```
Response: 204

### Messages

#### GET /workspaces/{workspace_id}/channels/{channel_id}/messages
Query params: `limit=50`, `before_id`
Response: 200
```json
{
  "messages": [
    {
      "id": "string",
      "user_id": "string",
      "content": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "reactions": [{"emoji": "string", "users": ["user_id"]}],
      "attachments": [{"id": "string", "filename": "string", "size": "number"}]
    }
  ],
  "has_more": "boolean"
}
```

#### POST /workspaces/{workspace_id}/channels/{channel_id}/messages
Request:
```json
{
  "content": "string",
  "attachments": ["file_id"]
}
```
Response: 201 (same as single message)

#### PATCH /messages/{message_id}
Request:
```json
{
  "content": "string"
}
```
Response: 200 (updated message)

#### DELETE /messages/{message_id}
Response: 204

#### POST /messages/{message_id}/reactions
Request:
```json
{
  "emoji": "string"
}
```
Response: 204

### Direct Messages

#### GET /workspaces/{workspace_id}/direct-messages
Response: 200
```json
{
  "conversations": [
    {
      "id": "string",
      "participants": ["user_id"],
      "last_message": "message_object",
      "unread_count": "number"
    }
  ]
}
```

#### POST /workspaces/{workspace_id}/direct-messages
Request:
```json
{
  "participant_ids": ["user_id"]
}
```
Response: 201 (conversation object)

### Files

#### POST /files
Request: multipart/form-data
- file: binary
- workspace_id: string

Response: 201
```json
{
  "id": "string",
  "filename": "string",
  "size": "number",
  "mimetype": "string",
  "url": "string"
}
```
Errors: 413 (file too large)

#### GET /files/{file_id}
Response: Binary file data

### Users

#### GET /workspaces/{workspace_id}/users
Response: 200
```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar_url": "string",
      "presence": "online|offline",
      "role": "admin|member"
    }
  ]
}
```

#### GET /users/me
Response: 200 (current user object)

#### PATCH /users/me
Request:
```json
{
  "name": "string",
  "avatar_url": "string"
}
```
Response: 200 (updated user)

### Search

#### GET /workspaces/{workspace_id}/search
Query params: `q` (query), `type` (messages|files|users)
Response: 200
```json
{
  "results": [
    {
      "type": "message|file|user",
      "data": "object"
    }
  ]
}
```

### Admin

#### GET /workspaces/{workspace_id}/admin/stats
Response: 200
```json
{
  "user_count": "number",
  "channel_count": "number",
  "message_count": "number",
  "storage_used": "number",
  "daily_active_users": "number"
}
```

#### POST /workspaces/{workspace_id}/admin/invites
Request:
```json
{
  "email": "string"
}
```
Response: 204

#### DELETE /workspaces/{workspace_id}/admin/users/{user_id}
Response: 204

## WebSocket Events

### Connection
URL: `/ws?token=<jwt_token>&workspace_id=<workspace_id>`

### Client Events

#### message.send
```json
{
  "type": "message.send",
  "channel_id": "string",
  "content": "string"
}
```

#### typing.start
```json
{
  "type": "typing.start",
  "channel_id": "string"
}
```

#### typing.stop
```json
{
  "type": "typing.stop",
  "channel_id": "string"
}
```

#### presence.update
```json
{
  "type": "presence.update",
  "status": "online|away|offline"
}
```

### Server Events

#### message.created
```json
{
  "type": "message.created",
  "message": "message_object"
}
```

#### message.updated
```json
{
  "type": "message.updated",
  "message": "message_object"
}
```

#### message.deleted
```json
{
  "type": "message.deleted",
  "message_id": "string",
  "channel_id": "string"
}
```

#### typing.user
```json
{
  "type": "typing.user",
  "channel_id": "string",
  "user_id": "string",
  "is_typing": "boolean"
}
```

#### presence.changed
```json
{
  "type": "presence.changed",
  "user_id": "string",
  "status": "online|away|offline"
}
```

## Error Responses

All errors follow format:
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Common codes:
- `unauthorized`: Missing or invalid token
- `forbidden`: No access to resource
- `not_found`: Resource doesn't exist
- `validation_error`: Invalid request data
- `rate_limited`: Too many requests