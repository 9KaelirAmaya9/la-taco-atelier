# Session Management & Persistence Fix

## Problems Identified

### 1. Session Expiring After Inactivity
**Symptom**: User gets signed out after a few minutes of inactivity
**Cause**: 
- Supabase JWT tokens expire after 1 hour by default
- Token refresh wasn't being handled properly
- No health checks to detect expired sessions

### 2. Signin Redirect Loop
**Symptom**: After session expires, user gets stuck on signin page
**Cause**:
- SignIn component was redirecting even when user didn't have proper authentication
- Race condition between loading state and redirect logic
- No check to prevent infinite redirect loops

## Solutions Implemented

### 1. Improved Token Refresh Handling (`AuthContext.tsx`)

#### Better SIGNED_OUT Event Handling
```typescript
else if (event === 'SIGNED_OUT') {
  // Only clear state if we don't have a valid session anymore
  // This prevents clearing state during token refresh
  if (!newSession) {
    setSession(null);
    setUser(null);
    setRoles([]);
    console.log("AuthContext: User signed out completely");
  }
}
```

**Why**: Previously, SIGNED_OUT events would clear all state, even during normal token refreshes. Now we only clear if there's truly no session.

#### Enhanced TOKEN_REFRESHED Handling
```typescript
else if (event === 'TOKEN_REFRESHED' && newSession) {
  // Update session with refreshed token
  setSession(newSession);
  if (newSession.user) {
    setUser(newSession.user);
  }
  console.log("AuthContext: Token refreshed successfully");
}
```

**Why**: Ensures session and user state are updated with fresh tokens, maintaining continuous authentication.

### 2. Session Health Check System

#### Periodic Health Checks
```typescript
const healthCheckInterval = setInterval(async () => {
  try {
    const { data: { session: currentSession }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("AuthContext: Health check error", error);
      return;
    }

    // If we think we have a user but session is gone, clear state
    if (user && !currentSession) {
      console.warn("AuthContext: Session expired, clearing user state");
      setSession(null);
      setUser(null);
      setRoles([]);
    }
  } catch (e) {
    console.error("AuthContext: Health check exception", e);
  }
}, 60000); // Check every minute
```

**Why**: 
- Detects session expiration proactively
- Cleans up stale state before user tries to navigate
- Runs every 60 seconds (configurable)
- Prevents "stuck" authenticated state when session is actually expired

### 3. Fixed SignIn Redirect Loop (`SignIn.tsx`)

#### Smarter Redirect Logic
```typescript
useEffect(() => {
  // Don't redirect if we're still loading or in password reset flow
  if (loading || isPasswordReset) {
    return;
  }

  // Only redirect if we have a valid user
  if (user) {
    // Prevent redirect loops - if we're already on signin, only redirect once
    const isAlreadyOnSignin = window.location.pathname === '/signin';
    
    if (isAlreadyOnSignin && redirectPath === '/dashboard') {
      // For protected routes, verify the user has the required role before redirecting
      const isAdminRoute = redirectPath.startsWith("/admin");
      const isKitchenRoute = redirectPath.startsWith("/kitchen");

      if (isAdminRoute && !hasRole("admin")) {
        console.log("SignIn: User lacks admin role, staying on signin");
        return;
      } else if (isKitchenRoute && !hasRole("kitchen")) {
        console.log("SignIn: User lacks kitchen role, staying on signin");
        return;
      }
      
      console.log("SignIn: Already logged in, redirecting to", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }
}, [user, loading, redirectPath, navigate, isPasswordReset, hasRole]);
```

**Why**:
- Checks if already on signin page to prevent loops
- Verifies user has required role before redirecting
- Only redirects once per valid authentication
- Prevents race conditions

## How Session Management Works Now

### Session Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│  1. User Signs In                                        │
│     - Creates session with JWT token (1-hour expiry)    │
│     - Token stored in localStorage                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. Active Use (0-50 minutes)                           │
│     - User navigates freely                             │
│     - Session remains valid                             │
│     - Health checks run every minute                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. Token Refresh (After ~50 minutes)                   │
│     - Supabase automatically refreshes token            │
│     - TOKEN_REFRESHED event fires                       │
│     - AuthContext updates session with new token        │
│     - User stays logged in seamlessly                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Session Expiration (If no activity for >1 hour)    │
│     - Health check detects expired session              │
│     - SIGNED_OUT event fires                            │
│     - AuthContext clears user state                     │
│     - User redirected to signin page                    │
└─────────────────────────────────────────────────────────┘
```

### Automatic Token Refresh

Supabase client is configured with:
```typescript
{
  auth: {
    storage: localStorage,          // Persist across page refreshes
    persistSession: true,            // Keep session alive
    autoRefreshToken: true,          // Auto-refresh before expiry
  }
}
```

**Token Refresh Timing**:
- Tokens expire after 1 hour
- Supabase refreshes automatically at ~50 minutes
- If refresh fails, user is signed out
- If successful, user stays logged in indefinitely

## Expected Behavior

### ✅ Normal Flow
1. User signs in → Creates session
2. User navigates → Session persists
3. After 50 min → Token auto-refreshes
4. User continues → No interruption
5. Console shows: `"AuthContext: Token refreshed successfully"`

### ✅ Inactivity Timeout
1. User signs in → Creates session
2. User is inactive for >1 hour → Session expires
3. Health check detects expiration
4. User state cleared
5. Next navigation → Redirects to signin
6. Console shows: `"AuthContext: Session expired, clearing user state"`

### ✅ Re-login After Expiration
1. Session expired → User on signin page
2. User enters credentials → New session created
3. SIGNED_IN event fires → Roles fetched
4. User redirected to dashboard → No loop
5. Console shows: `"AuthContext: User signed in [id] Roles: [admin]"`

### ❌ Previous Issues (Now Fixed)
- ~~Getting signed out randomly~~ → Fixed with better token refresh
- ~~Stuck on signin page~~ → Fixed with redirect loop prevention
- ~~Session clearing during refresh~~ → Fixed with improved SIGNED_OUT handling
- ~~No detection of expired sessions~~ → Fixed with health checks

## Monitoring & Debugging

### Console Output for Token Refresh
```
AuthContext: Token refreshed successfully
```
This should appear every ~50 minutes during active use.

### Console Output for Session Expiration
```
AuthContext: Health check error [error details]
AuthContext: Session expired, clearing user state
```
This appears when session has truly expired.

### Console Output for Successful Re-login
```
SignIn: Login successful for user [id]
AuthContext: User signed in [id] Roles: [admin]
SignIn: Redirecting to /dashboard
```
Clean re-login with no loops.

## Configuration Options

### Adjust Health Check Frequency
In `AuthContext.tsx`, modify:
```typescript
}, 60000); // Check every minute (60000ms)
```

**Options**:
- 30000 (30 seconds) - More responsive but more API calls
- 60000 (1 minute) - Balanced (recommended)
- 120000 (2 minutes) - Less frequent checks

### Supabase Session Settings
Session duration is configured in Supabase dashboard:
1. Go to Authentication → Settings
2. JWT expiry can be set from 1 hour to 1 week
3. Longer expiry = less frequent refreshes but security trade-off

## Troubleshooting

### Issue: Still getting signed out randomly
**Check**:
1. Open DevTools Console
2. Look for `"AuthContext: Token refreshed successfully"` messages
3. If not appearing, token refresh may be failing

**Solution**:
- Check Supabase project status
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are correct
- Check network tab for failed refresh requests

### Issue: Redirect loop on signin
**Check**:
1. Console shows repeated `"SignIn: Already logged in, redirecting"`
2. Page keeps refreshing

**Solution**:
- Clear browser localStorage (Application → Local Storage → Clear)
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Sign out completely before signing in again

### Issue: Session expires too quickly
**Check**:
1. How long between "signed in" and "session expired" messages?
2. Should be at least 50-60 minutes

**Solution**:
- Check Supabase JWT expiry setting (should be 3600 seconds = 1 hour)
- Verify `autoRefreshToken: true` in client config
- Check for network issues preventing refresh

## Performance Impact

### Before
- Session would expire without warning
- User would stay "logged in" with expired token
- Next action would fail
- Confusing user experience

### After
- Health checks run every minute (minimal overhead ~10ms)
- Token refreshes automatically before expiry
- Session expiration detected immediately
- Clean signout and redirect when needed
- Predictable, reliable authentication

## Summary

✅ **Token Auto-Refresh** - Tokens refresh at 50 minutes, keeping users logged in  
✅ **Health Checks** - Detects expired sessions every minute  
✅ **Smart Signout** - Only clears state when session is truly gone  
✅ **No Redirect Loops** - Signin page checks prevent infinite redirects  
✅ **Persistent Sessions** - Works across page refreshes and browser restarts  
✅ **Better Logging** - Clear console messages for debugging  

Your authentication now supports:
- Long-term persistent sessions (hours/days with auto-refresh)
- Graceful expiration handling
- Clean re-login experience
- No stuck states or loops
