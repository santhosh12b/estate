# Gubera Vasal — Neon PostgreSQL & Vercel Backend Guide

Your project now uses a unified **Vercel Serverless Node.js + Neon PostgreSQL** architecture. 

---

## 1. Quick Neon Database Setup (2 Minutes)

1. Log into [Neon Console](https://console.neon.tech).
2. Create a new project (e.g. `gubera-vasal`), selecting the AWS region closest to India (e.g. `ap-southeast-1` Singapore or nearest).
3. On your project dashboard, copy the **Connection string** (Choose **Pooled** or **Direct**). It looks like:
   ```text
   postgresql://alex:AbCdEf123@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## 2. Initialize the Database Table

You can run the schema in either of two ways:

### Option A: Via Neon SQL Editor (Recommended)
1. In the Neon Console sidebar, click **SQL Editor**.
2. Copy the contents of [`neon-schema.sql`](./neon-schema.sql) and paste them into the editor.
3. Click **Run**. Your `enquiries` table and indexes will be created immediately.

### Option B: Via Setup API
Once your site is deployed to Vercel with `DATABASE_URL` configured, visit:
```
https://your-vercel-domain.vercel.app/api/setup-db?key=gubera_vasal_secret_admin_2026
```

---

## 3. Add Environment Variables to Vercel

1. Open your Vercel Project Dashboard: [vercel.com](https://vercel.com).
2. Navigate to **Settings** → **Environment Variables**.
3. Add the following variables:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL connection string |
| `ADMIN_API_KEY` | `your_secret_admin_key` | Protects lead retrieval & DB setup |

4. Trigger a Redeploy (or push a new commit via git).

---

## 4. Testing & Verifying Endpoints

- **Health Check**:
  ```text
  GET https://your-vercel-domain.vercel.app/api/health
  ```
  Returns connection status and query latency in milliseconds.

- **Submit Enquiry (Automated from Website)**:
  ```text
  POST https://your-vercel-domain.vercel.app/api/enquiries
  ```
  Payload:
  ```json
  {
    "fullName": "Karthik Raja",
    "phoneNumber": "9842212345",
    "email": "karthik@example.com",
    "preferredLocation": "Coimbatore",
    "propertyType": "Gated Community Plots",
    "budget": "₹20 Lakhs – ₹35 Lakhs",
    "message": "Interested in site inspection"
  }
  ```
  Response (under 500ms):
  ```json
  {
    "success": true,
    "enquiryCode": "GV-261103-X8K2",
    "message": "Enquiry submitted successfully to Gubera Vasal!",
    "database": "Neon PostgreSQL"
  }
  ```

- **View Leads (Admin)**:
  ```text
  GET https://your-vercel-domain.vercel.app/api/enquiries?key=your_secret_admin_key
  ```
  or pass header: `x-admin-key: your_secret_admin_key`. Returns the latest 100 leads formatted in JSON.

