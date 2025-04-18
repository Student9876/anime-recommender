/**
 * Checks if code is running in browser environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Generates a random string for use as the state parameter in OAuth
 */
export function generateStateValue(): string {
  const state = Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
  
  // Store the state in localStorage only if in browser
  if (isBrowser()) {
    localStorage.setItem('oauthState', state);
  }
  return state;
}

/**
 * Generates a code verifier for PKCE OAuth flow
 * The PKCE spec requires code verifier to be between 43 and 128 characters
 */
export function generateCodeVerifier(): string {
  // Generate a random string with appropriate length (43-128 chars)
  let verifier = '';
  
  // Generate multiple segments to ensure we have at least 43 characters
  const segments = 4; // This should produce ~80 characters
  for (let i = 0; i < segments; i++) {
    verifier += Math.random().toString(36).substring(2, 22);
  }
  
  // If by any chance it's too long, trim it to max length
  if (verifier.length > 128) {
    verifier = verifier.substring(0, 128);
  }
  
  // If it's too short, pad it
  while (verifier.length < 43) {
    verifier += Math.random().toString(36).substring(2, 10);
  }
  
  // Store the code verifier in localStorage only if in browser
  if (isBrowser()) {
    localStorage.setItem('codeVerifier', verifier);
  }
  
  return verifier;
}

/**
 * For plain method, code challenge is the same as code verifier
 * MAL supports 'plain' method which is simpler
 */
export function generateCodeChallenge(): string {
  const verifier = generateCodeVerifier();
  // With plain method, challenge is identical to verifier
  return verifier;
}