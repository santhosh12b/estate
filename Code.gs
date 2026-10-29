/**
 * =======================================================================
 * ESTATE REAL ESTATE — GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =======================================================================
 * 
 * Target Sheet Name: "Enquiries"
 * 
 * Column Headings (Row 1):
 * Column A: Enquiry ID
 * Column B: Submission Date
 * Column C: Customer Name
 * Column D: Phone Number
 * Column E: Email
 * Column F: Preferred Location
 * Column G: Property Type
 * Column H: Budget
 * Column I: Message
 * Column J: Enquiry Status
 * 
 * =======================================================================
 */

// OPTIONAL: Add WhatsApp Cloud API credentials if you want instant WhatsApp alerts
var WA_PHONE_ID = ''; // e.g. '1213326388541104'
var WA_TOKEN = '';    // e.g. 'EAAPeZClLfkk0...'
var ADMIN_PHONE = ''; // e.g. '919842212345' (receives alert on new lead)

/**
 * Handle POST requests from the website (Enquiry Form & Contact Popup)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent writes to prevent data loss
  lock.tryLock(10000);

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = spreadsheet.getSheets();
    var sheet = null;

    // Automatically find the sheet that has "Enquiry ID" in Row 1 (or named "Enquiries")
    for (var i = 0; i < sheets.length; i++) {
      var cellA1 = String(sheets[i].getRange(1, 1).getValue()).trim().toLowerCase();
      if (cellA1 === 'enquiry id' || sheets[i].getName().toLowerCase() === 'enquiries') {
        sheet = sheets[i];
        break;
      }
    }

    // Fallback to the first sheet if not matched
    if (!sheet) {
      sheet = sheets[0];
    }

    // Parse incoming data payload
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Extract enquiry attributes with safe fallbacks
    var fullName = String(data.fullName || data.name || data['Customer Name'] || '').trim();
    var rawPhone = String(data.phoneNumber || data.phone || data['Phone Number'] || '').trim();
    var email = String(data.email || data['Email'] || '').trim();
    var preferredLocation = String(data.preferredLocation || data.location || data['Preferred Location'] || 'Any Location').trim();
    var propertyType = String(data.propertyType || data['Property Type'] || 'Any Type').trim();
    var budget = String(data.budget || data['Budget'] || 'Flexible').trim();
    var message = String(data.message || data['Message'] || '').trim();

    // Generate unique Enquiry ID: e.g. ENQ-20261029-114522
    var enquiryId = 'ENQ-' + Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyyMMdd-HHmmss');
    
    // Human readable IST date & time: e.g. 29/10/2026, 11:45:22
    var submissionDate = Utilities.formatDate(new Date(), 'GMT+5:30', 'dd/MM/yyyy, hh:mm:ss a');

    // Format phone with single quote prefix so Google Sheets treats it as Text (prevents formula errors or dropped leading +/0)
    var formattedPhone = rawPhone ? "'" + rawPhone : "";

    // Append enquiry row in exact matching order:
    // [Enquiry ID, Submission Date, Customer Name, Phone Number, Email, Preferred Location, Property Type, Budget, Message, Enquiry Status]
    sheet.appendRow([
      enquiryId,
      submissionDate,
      fullName,
      formattedPhone,
      email,
      preferredLocation,
      propertyType,
      budget,
      message,
      'New Lead'
    ]);

    // Optional: Send WhatsApp notification if credentials are configured
    if (WA_PHONE_ID && WA_TOKEN && ADMIN_PHONE) {
      sendWhatsAppLeadAlert(ADMIN_PHONE, fullName, rawPhone, preferredLocation, budget);
    }

    // Return JSON Success Response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Enquiry recorded successfully',
      enquiryId: enquiryId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests (Testing & Public Project Listings)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'health_check';
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // 1. PUBLIC READ: Retrieve project listings if "Projects" sheet exists
  if (action === 'get_projects') {
    var sheet = spreadsheet.getSheetByName('Projects');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Projects sheet not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var projects = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
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

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      projects: projects 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Default Health Check response
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    platform: 'ESTATE Real Estate API',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Send WhatsApp Lead Notification
 */
function sendWhatsAppLeadAlert(recipientPhone, name, phone, location, budget) {
  try {
    var url = 'https://graph.facebook.com/v19.0/' + WA_PHONE_ID + '/messages';
    var textBody = '🏡 *NEW ESTATE LEAD RECEIVED*\n\n' +
      '• *Client:* ' + name + '\n' +
      '• *Phone:* ' + phone + '\n' +
      '• *Region:* ' + location + '\n' +
      '• *Budget:* ' + budget + '\n\n' +
      'Check your Google Sheet for details.';

    var payload = {
      messaging_product: 'whatsapp',
      to: recipientPhone.replace(/[^0-9]/g, ''),
      type: 'text',
      text: { body: textBody }
    };

    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + WA_TOKEN },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log('WhatsApp notification error: ' + err.toString());
  }
}
