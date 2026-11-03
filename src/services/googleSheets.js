/**
 * Legacy Google Sheets Adapter - Seamlessly delegated to the Neon PostgreSQL Backend API
 */
import { submitEnquiry, fetchProjects } from './api';

export const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

export async function fetchProjectsFromSheets() {
  return fetchProjects();
}

export async function submitEnquiryToSheets(enquiry) {
  return submitEnquiry(enquiry);
}
