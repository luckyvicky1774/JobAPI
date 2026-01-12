# Setup

```bash
npm install && npm start
```

# Database Connection

1. Import connect.js
2. Invoke in start()
3. Setup .env in the root
4. Add MONGO_URI with correct value

# Routers

- auth.js
- jobs.js

# User Model

Email Validation Regex

```regex
/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
```

# Register User

- Validate - name, email, password - with Mongoose
- Hash Password (with bcryptjs)
- Save User
- Generate Token
- Send Response with Token

# Login User

- Validate - email, password - in controller
- If email or password is missing, throw BadRequestError
- Find User
- Compare Passwords
- If no user or password does not match, throw UnauthenticatedError
- If correct, generate Token
- Send Response with Token

# Mongoose Errors

- Validation Errors
- Duplicate (Email)
- Cast Error

# Security

- helmet
- cors
- xss-clean
- express-rate-limit


# Authentication Flow (Register & Login)

This document describes the complete **user authentication flow** using **Node.js, Express, MongoDB (Mongoose), bcrypt, and JWT**. It covers **registration**, **login**, and **authenticated requests**.

## 1. User Registration Flow

### Step 1: Client sends registration request

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Shu",
  "email": "shu@email.com",
  "password": "123456"
}
```

---

### Step 2: Server validates input

* Check required fields
* Check if email already exists

---

### Step 3: Create user (password hashing)

```js
const user = await User.create({ name, email, password })
```

A **Mongoose pre-save middleware** hashes the password automatically:

```js
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})
```

✅ Plain text passwords are **never stored** in the database.

---

### Step 4: Generate JWT

```js
const token = user.createJWT()
```

* Payload typically includes: `userId`, `name`
* Signed using a **server-side JWT_SECRET**
* Includes expiration time

---

### Step 5: Send response

```js
res.status(201).json({
  user: { name: user.name },
  token
})
```

📌 Registration usually acts as **automatic login**.

---

## 2. User Login Flow

### Step 1: Client sends login request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "shu@email.com",
  "password": "123456"
}
```

---

### Step 2: Find user by email

```js
const user = await User.findOne({ email })
```

* If user not found → error

---

### Step 3: Compare passwords

```js
const isMatch = await bcrypt.compare(password, user.password)
```

* Compares **plain text password** with **hashed password**
* Passwords are never decrypted

---

### Step 4: Generate a new JWT

```js
const token = user.createJWT()
```

📌 Every successful login issues a **new token**.

---

### Step 5: Send response

```js
res.status(200).json({
  user: { name: user.name },
  token
})
```

---

## 3. Authenticated Requests Flow

### Step 1: Client stores token

* localStorage / memory / cookie (implementation dependent)

---

### Step 2: Client sends token with requests

```http
GET /api/jobs
Authorization: Bearer <JWT_TOKEN>
```

---

### Step 3: Auth middleware verifies token

```js
const payload = jwt.verify(token, process.env.JWT_SECRET)
req.user = {
  userId: payload.userId,
  name: payload.name
}
next()
```

* Verifies token integrity and expiration
* Attaches user info to `req.user`

---

### Step 4: Controller accesses authenticated user

```js
req.user.userId
```

---

## 4. Flow Summary

```text
Register:
Client → Server → Hash password → Save user → Issue JWT

Login:
Client → Server → Verify password → Issue JWT

Authenticated Request:
Client → Send JWT → Verify JWT → Access protected resource
```

---

## 5. Key Security Notes

* Passwords are stored as **bcrypt hashes**
* JWT secret is **server-side only** and shared across users
* User identity comes from **JWT payload**, not the secret
* Tokens have expiration times

---

## 6. One-Sentence Summary

> Registration hashes the user’s password and issues a JWT, login verifies the password and issues a new JWT, and authenticated requests use the token in the Authorization header for verification.

---

## Future Improvements (Optional)

* Refresh tokens
* Logout / token invalidation strategy
* HTTP-only cookies
* Role-based authorization


Swagger UI

```yaml
/jobs/{id}:
  parameters:
    - in: path
      name: id
      schema:
        type: string
      required: true
      description: the job id
```
