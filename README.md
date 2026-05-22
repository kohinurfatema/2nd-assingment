# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** https://2nd-assingment.vercel.app

---

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor / maintainer)
- Create, read, update, and delete issues
- Filter and sort issues by type and status
- System metrics dashboard for maintainers

---

## Tech Stack

| Technology | Usage |
|---|---|
| Node.js (24.x) | Runtime |
| TypeScript | Language |
| Express.js | Web framework |
| PostgreSQL (NeonDB) | Database |
| pg (native driver) | Raw SQL queries |
| bcrypt | Password hashing |
| jsonwebtoken | JWT auth |
| http-status-codes | HTTP status constants |

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/kohinurfatema/2nd-assingment.git
cd 2nd-assingment
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```
DATABASE_URL=your_neondb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### 4. Run database migration
Run the SQL in `src/config/schema.sql` via your database dashboard or:
```bash
npm run migrate
```

### 5. Start the development server
```bash
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/signup | Public | Register a new user |
| POST | /api/auth/login | Public | Login and receive JWT |

### Issues
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/issues | Authenticated | Create a new issue |
| GET | /api/issues | Public | Get all issues (filterable) |
| GET | /api/issues/:id | Public | Get a single issue |
| PATCH | /api/issues/:id | Authenticated | Update an issue |
| DELETE | /api/issues/:id | Maintainer | Delete an issue |

#### GET /api/issues query parameters
| Param | Values | Default |
|---|---|---|
| sort | newest, oldest | newest |
| type | bug, feature_request | - |
| status | open, in_progress, resolved | - |

### Metrics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/metrics | Maintainer | Get system metrics |

---

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| password | VARCHAR(255) | Bcrypt hashed |
| role | VARCHAR(20) | contributor or maintainer |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### issues
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required |
| description | TEXT | Min 20 chars |
| type | VARCHAR(20) | bug or feature_request |
| status | VARCHAR(20) | open, in_progress, resolved |
| reporter_id | INTEGER | References users.id |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

---

## Authorization

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: <your_token>
```
