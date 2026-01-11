import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Auth page now just redirects to /signin.
 * Recovery tokens (password reset links) work on /signin directly.
 */
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve any query params and hash (for recovery tokens)
    const queryString = searchParams.toString();
    const hash = window.location.hash;
    
    let targetUrl = "/signin";
    if (queryString) {
      targetUrl += `?${queryString}`;
    }
    if (hash) {
      targetUrl += hash;
    }
    
    navigate(targetUrl, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

export default Auth;