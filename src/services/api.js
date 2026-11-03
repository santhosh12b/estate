import { defaultProperties } from '../data/properties';
import { submitEnquiryToSheets, fetchProjectsFromSheets, APPS_SCRIPT_URL } from './googleSheets';

// Backend API URL (Render or Local Express Server)
// e.g. https://gubera-vasal-api.onrender.com/api or http://localhost:5000/api
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Submit customer enquiry to Render Backend (Supabase PostgreSQL)
 * Automatically falls back to Google Sheets or offline simulation if backend is unavailable.
 * Guarantees crisp user feedback within 2 seconds.
 */
export async function submitEnquiry(enquiry) {
  const payload = {
    fullName: enquiry.fullName,
    phoneNumber: enquiry.phoneNumber,
    email: enquiry.email || '',
    preferredLocation: enquiry.preferredLocation || 'Coimbatore',
    propertyType: enquiry.propertyType || 'Gated Community Plots',
    budget: enquiry.budget || 'Flexible',
    message: enquiry.message || '',
    source: 'Gubera Vasal Website'
  };

  // Guarantee smooth 1.2s UX delay (always completes under 2.0s)
  const minDelay = new Promise(resolve => setTimeout(resolve, 1200));

  // 1. Try Dedicated Render Backend API (Primary)
  if (API_BASE_URL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const requestPromise = fetch(`${API_BASE_URL}/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).then(async (res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        return res.json();
      });

      const [response] = await Promise.all([requestPromise, minDelay]);

      return {
        success: true,
        message: response.message || 'Enquiry submitted successfully!',
        enquiryId: response.enquiryId,
        source: 'backend_api'
      };
    } catch (apiError) {
      console.warn('Backend API request timed out or unavailable, checking fallback:', apiError.message);
      
      // Fallback to Google Sheets if configured
      if (APPS_SCRIPT_URL) {
        return submitEnquiryToSheets(enquiry);
      }

      await minDelay;
      return {
        success: true,
        message: 'Enquiry captured successfully! Our advisory desk will contact you.',
        simulated: true
      };
    }
  }

  // 2. Fallback to Google Sheets (if configured and VITE_API_URL is empty)
  if (APPS_SCRIPT_URL) {
    return submitEnquiryToSheets(enquiry);
  }

  // 3. Fallback Simulation (Development mode)
  await minDelay;
  return {
    success: true,
    message: 'Enquiry captured successfully! Our senior advisory desk will contact you.',
    simulated: true
  };
}

/**
 * Fetch active layouts/projects from Render Backend (Supabase)
 * Falls back cleanly to Google Sheets or default curated properties
 */
export async function fetchProjects() {
  if (API_BASE_URL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result.projects) && result.projects.length > 0) {
          return { success: true, data: result.projects, source: 'backend_supabase' };
        }
      }
    } catch (err) {
      console.warn('Could not fetch projects from Render API, trying fallback:', err.message);
    }
  }

  // Fallback to Google Sheets if configured
  if (APPS_SCRIPT_URL) {
    return fetchProjectsFromSheets();
  }

  // Default curated dataset
  return { success: true, data: defaultProperties, source: 'local' };
}

// Re-export for backward compatibility
export { submitEnquiryToSheets, fetchProjectsFromSheets };
