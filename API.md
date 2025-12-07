# API Specification for server.js

This document describes the API endpoints provided by the impulse_ultra server application.

## Base URL
```
http://localhost:3000
```

-or-
```
http://impulse-server.local:3000
```

## Authentication
Authentication is required for certain endpoints and is handled via user session management.

## Endpoints

### POST /register
**Description:** Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- Success: `200 OK`
```json
{
  "success": true,
  "message": "회원가입 성공! 로그인해주세요."
}
```
- Error: `200 OK` (with success: false for validation errors) or `500 Internal Server Error`
```json
{
  "success": false,
  "message": "이미 존재하는 아이디입니다."
}
```

### POST /login
**Description:** Log in an existing user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- Success: `200 OK`
```json
{
  "success": true,
  "user_id": "number",
  "username": "string"
}
```
- Error: `200 OK` or `500 Internal Server Error`

### GET /reset
**Description:** Reset the current score and start measurement.

**Response:**
- `200 OK`
```json
{
  "message": "Score reset"
}
```

### GET /score
**Description:** Get the current score.

**Response:**
- `200 OK`
```json
{
  "score": "number"
}
```

### POST /sensor
**Description:** Receive sensor data from ESP32.

**Request Body:**
```json
{
  "accel_x": "number",
  "accel_y": "number",
  "accel_z": "number"
}
```

**Response:**
- `200 OK`
```json
{
  "message": "Data received",
  "score": "number"
}
```

### GET /rankings
**Description:** Get top 10 rankings.

**Response:**
- `200 OK`
```json
{
  "rankings": [
    {
      "username": "string",
      "best_score": "number"
    }
  ]
}
```

### POST /save-score
**Description:** Save the current score for a user.

**Request Body:**
```json
{
  "user_id": "number",
  "score": "number"
}
```

**Response:**
- `200 OK`
```json
{
  "message": "Score saved"
}
```

### GET /user-score/{user_id}
**Description:** Get the best score for a specific user.

**Path Parameters:**
- `user_id`: The user's ID

**Response:**
- `200 OK`
```json
{
  "score": "number"
}
```

### GET /user-scores/{user_id}
**Description:** Get all scores for a specific user.

**Path Parameters:**
- `user_id`: The user's ID

**Response:**
- `200 OK`
```json
{
  "scores": ["number"]
}
```

### GET /global-stats
**Description:** Get global statistics.

**Response:**
- `200 OK`
```json
{
  "best_score": "number",
  "average": "number"
}
```

## Static Files
Static files are served from the `/data` directory via `GET /{filename}`.
