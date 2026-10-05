# API_INVENTORY.md - SutraStudio API Specification

| Endpoint | Method | Auth | Inputs (JSON / Params) | Outputs | Storage / Services | Error States |
|---|---|---|---|---|---|---|
| `/api/auth/session` | POST | ID Token | `{ idToken: string }` | `{ uid, email, role, status }` | Firebase Auth | 400 Bad Token, 401 Unauthorized, 500 Error |
| `/api/chat` | POST | Bearer Token | `{ message: string, conversationId?: string }` | `{ reply: string, classification?: { service, confidence }, conversationId }` | Firestore `conversations`, AI Provider | 400 Missing Message, 401 Unauthorized, 500 AI Error |
| `/api/orders` | GET | Bearer Token | `?clientId=...` | `{ orders: Order[] }` | Firestore `orders` | 401 Unauthorized, 403 Forbidden |
| `/api/orders` | POST | Bearer Token | `{ serviceId, packageId, brief, referenceLinks }` | `{ orderId, status, createdAt }` | Firestore `orders`, Google Drive | 400 Validation Error, 401 Unauthorized |
| `/api/inquiries` | POST | None | `{ name, email, company, serviceType, message }` | `{ success: true, inquiryId }` | Firestore `inquiries` | 400 Invalid Input, 429 Rate Limit |
| `/api/workflows` | POST | Bearer Token (Admin) | `{ orderId, workflowType, action }` | `{ runId, status, step }` | Firestore `workflowRuns`, n8n | 401 Unauthorized, 403 Admin Only |
