# Ratings

A full-stack ratings platform with a Node/Express backend and a React/Vite frontend.

## Setup

### Backend

```powershell
cd backend
npm install
npm run seed
npm start
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Test Accounts

Use these seeded credentials for QA/testing:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ratings.local` | `Admin@1234` |
| Store Owner | `owner.alpha@ratings.local` | `Owner@1234` |
| User | `user.one@ratings.local` | `User@1234` |

## Notes

- The backend seed creates additional store owner and user accounts as well.
- If you change the API URL, set `VITE_API_BASE_URL` in `frontend/.env`.
- Copy `backend/.env.example` to `backend/.env` and fill in local secrets before running the backend.
