# Auth Admin Dashboard

React superadmin UI for the FastAPI auth API.

## Features

- **Login** — authenticates with the FastAPI `/auth/login` endpoint; stores Bearer token in localStorage
- **User table** — sortable columns, tab filters (All / Active / Inactive / Superusers), live search
- **Stats bar** — total, active, inactive, superuser counts
- **Edit user** — update email and full name
- **Reset password** — admin-initiated password reset with strength meter
- **Toggle active** — activate or deactivate an account with one click
- **Delete user** — confirmation dialog with typed username verification
- **Toast notifications** — non-blocking feedback for every action

## Quick Start

```bash
cd admin-dashboard
cp .env.example .env       # set REACT_APP_API_URL if your API isn't on localhost:8000
npm install
npm start
```

Open http://localhost:3000 and sign in with a superuser account.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000/api/v1` | Base URL for the FastAPI backend |

## Backend requirement

This app calls:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |
| GET | `/users/` | List all users |
| PATCH | `/users/{id}/activate` | Toggle active status |
| DELETE | `/users/{id}` | Delete user |
| PATCH | `/users/{id}` | Edit user (needs adding to backend) |

### Adding the edit + admin password reset endpoints to the backend

The backend `users.py` router needs two admin endpoints for full functionality:

```python
@router.patch("/{user_id}", response_model=UserResponse, dependencies=[Depends(get_current_superuser)])
async def admin_update_user(user_id: str, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    ...

@router.post("/{user_id}/reset-password", response_model=MessageResponse, dependencies=[Depends(get_current_superuser)])
async def admin_reset_password(user_id: str, new_password: str, db: AsyncSession = Depends(get_db)):
    user.hashed_password = hash_password(new_password)
    ...
```

## Project structure

```
src/
├── api/
│   └── client.js          # All fetch calls to the FastAPI backend
├── hooks/
│   ├── useAuth.js          # Auth context + login/logout logic
│   └── useUsers.js         # User list fetching + mutations
├── components/
│   ├── LoginPage.jsx        # Login screen
│   ├── Dashboard.jsx        # Main users table + sidebar
│   └── Modals.jsx           # Edit / Password / Delete modals
├── App.jsx
└── index.js
```
