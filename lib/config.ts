/**
 * Application configuration utilities
 * Provides access to base URL and other environment variables
 */

/**
 * Get the base URL for the application
 * Uses PAGE_RENDERING_SERVICE_URL environment variable
 * Falls back to http://localhost:3000 in local development
 */
export function getBaseURL(): string {
  // Check for NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL (client-side accessible)
  const publicUrl = process.env.NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL
  
  // In browser/client-side, prefer environment variable or use window.location.origin
  if (typeof window !== 'undefined') {
    return publicUrl || window.location.origin
  }
  
  // In server-side, check both NEXT_PUBLIC_ and regular env var
  return publicUrl || process.env.PAGE_RENDERING_SERVICE_URL || 'http://localhost:3000'
}

/**
 * Base URL constant for use throughout the application
 * This will be evaluated at module load time, so it may not reflect runtime changes
 * Use getBaseURL() function for dynamic access
 */
export const BASE_URL = getBaseURL()
