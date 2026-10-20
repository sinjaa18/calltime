
# Calltime

Calltime is a full-stack event requirement submission platform. Users can describe an event, select the type of professional support they need, provide category-specific details, review their information, and submit the requirement for storage.

## Features

- Four-step event requirement wizard.
- Three requirement categories: Event Planner, Performer, and Crew.
- Category-specific fields and client-side validation.
- Review screen before submission.
- Backend validation using Zod.
- REST API built with Express and TypeScript.
- MongoDB persistence using Mongoose.
- Unique requirement reference codes.
- Requirements listing and expandable saved details.
- Browser-local storage for remembering submitted record IDs.
- HTTP security headers using Helmet and configurable CORS.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod

## Project Structure

```text
calltime/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js and npm
- A MongoDB instance, such as MongoDB Atlas
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd calltime
```

Replace `<your-repository-url>` with your repository URL once one is configured.

### 2. Configure the backend

Create `backend/.env` using `backend/.env.example` as a template.

Set the following variables:

```env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
FRONTEND_URL=http://localhost:3000
```

Use your own MongoDB connection string. Do not commit real credentials.

Install dependencies and start the development server:

```bash
cd backend
npm install
npm run dev
```

The API runs on port 5000 by default.

### 3. Configure the frontend

In a second terminal, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then install dependencies and start Next.js:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/requirements` | Validate and create a requirement |
| GET | `/api/requirements?ids=<id1,id2>` | Retrieve specified requirements |

The requirements retrieval endpoint accepts record IDs rather than returning every record.

### Create a requirement

Send a JSON request body containing the event basics, selected category, category-specific details, and additional requirements.

A successful submission returns the saved record ID and generated requirement code.

### Retrieve requirements

Pass comma-separated MongoDB record IDs through the `ids` query parameter. Invalid IDs are rejected by the API.

## Validation and Error Handling

The frontend validates each wizard step before allowing the user to proceed. The backend performs its own request validation before saving data to MongoDB.

API errors are returned to the frontend so users can correct invalid information or retry failed requests.

## Production Builds

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

Configure the production environment variables through your hosting provider before deployment.

## Security and Current Limitations

- Database credentials must remain server-side and must never be exposed through `NEXT_PUBLIC_*` variables.
- CORS should allow only the intended frontend origins.
- The current requirements list remembers record IDs in browser local storage. It is not an authenticated user history system.
- Anyone who obtains a valid record ID may be able to retrieve that record through the current API. Production use should introduce authentication and authorization, with ownership checks on every record request.
- Production deployment requires HTTPS, appropriate database access controls, and production environment configuration.

## License

Add a license before distributing this project publicly.
