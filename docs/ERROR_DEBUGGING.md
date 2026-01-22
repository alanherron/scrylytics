# Error Debugging Guide

## Common Error Types in Scrylytics

### 0. **Webpack Module Not Found Errors**
These occur when the build cache is corrupted:

**Error:**
```
Error: Cannot find module './5611.js'
Require stack:
- .next/server/webpack-runtime.js
```

**Cause:**
- Corrupted `.next` build cache
- Stale webpack chunks after code changes
- Build artifacts out of sync

**How to fix:**
```bash
# Clean the build cache
rm -rf .next

# Rebuild
npm run build
```

**Prevention:**
- Always clean `.next` when switching branches
- Clean before production builds
- Consider adding to `.gitignore` (already there)

### 1. **400 Bad Request Errors**
These occur when the client sends invalid data:

**Oracle API (`/api/oracle`):**
- `"cardName is required and must be a non-empty string"` - Missing or empty card name
- `"links is required and must be a non-empty array"` - Missing or empty links array
- `"Invalid JSON in request body"` - Malformed JSON payload
- `"OPENAI_API_KEY environment variable is required"` - Missing API key

**How to fix:**
- Check the request payload matches the expected format
- Ensure all required fields are present
- Validate data types (string, array, etc.)

### 2. **500 Internal Server Errors**
These occur when something goes wrong on the server:

**Common causes:**
- OpenAI API quota exceeded (429) → Now handled with fallback
- Database connection failures → Gracefully handled, continues without cache
- Unexpected errors in API routes

**How to debug:**
1. Check server logs for the actual error message
2. Look at the `details` field in the error response
3. Check browser console for client-side errors

### 3. **OpenAI API Errors**

**429 - Quota Exceeded:**
```
"429 You exceeded your current quota, please check your plan and billing details"
```
- **Status:** Now handled with fallback summary
- **Action:** API returns a fallback response instead of error

**401 - Authentication Failed:**
```
"OpenAI API authentication failed. Please check your API key."
```
- **Status:** Returns 400 error
- **Action:** Check `.env` file for `OPENAI_API_KEY`

### 4. **Database Errors**

**Prisma Client Not Available:**
```
"Prisma client not available"
```
- **Status:** Gracefully handled, continues without caching
- **Action:** Check `DATABASE_URL` in `.env` file

**Database Connection Errors:**
- Cache operations fail silently
- API continues to work without caching
- Check `prisma/dev.db` exists

## How to Find Errors

### Browser Console (Client-side)
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API calls

### Server Logs (Server-side)
1. Check terminal where `npm run dev` is running
2. Look for `console.error` or `console.warn` messages
3. Check for stack traces

### API Response Format
```json
{
  "error": "Error message here",
  "details": "Additional error details"
}
```

## Debugging Steps

1. **Identify the error type:**
   - 400 = Client error (check request)
   - 500 = Server error (check logs)

2. **Check the error message:**
   - Read the `error` field in the response
   - Check `details` for more info

3. **Check environment variables:**
   ```bash
   # Check if .env file exists
   cat .env.local
   
   # Verify DATABASE_URL
   echo $DATABASE_URL
   
   # Verify OPENAI_API_KEY (don't print full value)
   echo ${OPENAI_API_KEY:0:10}...
   ```

4. **Check API route:**
   - Look at `app/api/oracle/route.ts`
   - Check error handling logic
   - Verify request validation

5. **Test the API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/oracle \
     -H "Content-Type: application/json" \
     -d '{"cardName":"test","links":[{"target":{"id":"card-1"},"value":0.85}]}'
   ```

## Common Fixes

### Missing Environment Variables
```bash
# Add to .env.local
OPENAI_API_KEY=your_key_here
DATABASE_URL="file:./prisma/dev.db"
```

### Database Not Initialized
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### OpenAI Quota Exceeded
- The API now uses fallback summaries
- No action needed, but consider upgrading OpenAI plan

## Getting Help

When reporting an error, include:
1. **Error message** (exact text)
2. **HTTP status code** (400, 500, etc.)
3. **Where it occurs** (which page/API route)
4. **Request payload** (if applicable)
5. **Browser console logs** (if client-side)
6. **Server logs** (if server-side)

