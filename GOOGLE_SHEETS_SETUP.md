# Google Sheets & Google Apps Script Integration Guide

This guide outlines how to configure your Google Spreadsheet with **ESTATE** to dynamically manage property listings and capture customer enquiries with zero third-party databases.

---

## 1. Google Spreadsheet Setup

Create a new Google Sheet named **"ESTATE Real Estate Management"**.

### Worksheet 1: `Projects`
Rename the first sheet to **`Projects`** and add the following columns in row 1:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Project ID** | **Project Name** | **Location** | **Property Type** | **Description** | **Starting Price** | **Image URL** | **Availability Status** | **Featured Status** |

#### Sample Row Data:
- **Project ID**: `prop-101`
- **Project Name**: `The Glass Pavilion`
- **Location**: `Coimbatore`
- **Property Type**: `Contemporary Residence`
- **Description**: `Minimalist cantilevered residence with internal courtyard and travertine flooring.`
- **Starting Price**: `₹3.40 Cr`
- **Image URL**: `https://your-domain.com/images/hero-villa.jpg`
- **Availability Status**: `Available`
- **Featured Status**: `TRUE`

---

### Worksheet 2: `Enquiries`
Create a second sheet named **`Enquiries`** and add the following columns in row 1:

| Column A | Column B | Column C | Column D | Column E | Column F | Column G | Column H | Column I | Column J |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Enquiry ID** | **Submission Date** | **Customer Name** | **Phone Number** | **Email** | **Preferred Location** | **Property Type** | **Budget** | **Message** | **Enquiry Status** |

---

## 2. Google Apps Script Code (`Code.gs`)

1. In your Google Sheet, click on **Extensions** ➔ **Apps Script**.
2. Replace all existing code in the editor with the following script:

```javascript
/**
 * ESTATE Real Estate Platform — Google Apps Script Backend
 * Manages public read-only project listings and private enquiry collection
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'get_projects';
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // 1. PUBLIC READ ENDPOINT: Retrieve Project Listings
  if (action === 'get_projects') {
    var sheet = spreadsheet.getSheetByName('Projects');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Projects sheet not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ projects: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var projects = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Only return projects marked as Available
      if (row[7] === 'Available' || row[7] === true || !row[7]) {
        projects.push({
          id: String(row[0] || ('prop-' + i)),
          name: String(row[1] || ''),
          location: String(row[2] || ''),
          propertyType: String(row[3] || 'Villa'),
          description: String(row[4] || ''),
          startingPrice: String(row[5] || ''),
          imageUrl: String(row[6] || '/images/hero-villa.jpg'),
          status: String(row[7] || 'Available'),
          featured: row[8] === true || String(row[8]).toLowerCase() === 'true'
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, projects: projects }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("ESTATE API Active");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write collisions

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // 2. PRIVATE WRITE ENDPOINT: Save Customer Enquiry
    if (action === 'save_enquiry') {
      var sheet = spreadsheet.getSheetByName('Enquiries');
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Enquiries');
        sheet.appendRow([
          'Enquiry ID', 'Submission Date', 'Customer Name', 'Phone Number',
          'Email', 'Preferred Location', 'Property Type', 'Budget', 'Message', 'Enquiry Status'
        ]);
      }

      var enquiryId = 'ENQ-' + Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyyMMdd-HHmmss');
      var dateStr = new Date().toLocaleString();

      // Format phone as text to avoid truncation of leading + or 0
      var phoneFormatted = "'" + String(data.phoneNumber || '').trim();

      sheet.appendRow([
        enquiryId,
        dateStr,
        String(data.fullName || '').trim(),
        phoneFormatted,
        String(data.email || '').trim(),
        String(data.preferredLocation || 'Any Location').trim(),
        String(data.propertyType || 'Any Type').trim(),
        String(data.budget || 'Flexible').trim(),
        String(data.message || '').trim(),
        'New Lead'
      ]);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Enquiry recorded successfully", 
        enquiryId: enquiryId 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

---

## 3. Deployment Steps

1. Click **Save** in the Apps Script editor.
2. Click **Deploy** ➔ **New deployment**.
3. Select type: **Web app**.
4. Configure:
   - **Description**: `ESTATE Web App v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(required so client website can send queries)*
5. Click **Deploy**.
6. Copy the generated **Web app URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 4. Connecting the Website

Create a `.env` file in your project root (`c:\xampp\htdocs\builder` or `c:\xampp\htdocs\v3`):

```bash
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart your Vite dev server (`npm run dev`) and all customer inquiries will immediately stream directly into your private Google Sheet!
