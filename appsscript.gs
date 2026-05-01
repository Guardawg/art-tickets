// Art Dept Ticket Tracker — Google Apps Script
// Deploy this as a Web App (Anyone can access) and paste the URL into the app settings

const SHEET_NAME = 'Tickets';
const HEADERS = ['ID', 'Title', 'Description', 'Priority', 'Category', 'Requester', 'Status', 'Created', 'Updated'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1a1a2e');
    headerRange.setFontColor('#e8d5a3');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 50);   // ID
    sheet.setColumnWidth(2, 180);  // Title
    sheet.setColumnWidth(3, 280);  // Description
    sheet.setColumnWidth(4, 80);   // Priority
    sheet.setColumnWidth(5, 90);   // Category
    sheet.setColumnWidth(6, 120);  // Requester
    sheet.setColumnWidth(7, 80);   // Status
    sheet.setColumnWidth(8, 140);  // Created
    sheet.setColumnWidth(9, 140);  // Updated
  }
  return sheet;
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // 1-indexed
  }
  return -1;
}

function ticketToRow(t) {
  return [t.id, t.title, t.desc, t.priority, t.category, t.requester, t.status, t.created, t.updated];
}

function upsertTicket(sheet, ticket) {
  const row = findRowById(sheet, ticket.id);
  if (row === -1) {
    sheet.appendRow(ticketToRow(ticket));
  } else {
    sheet.getRange(row, 1, 1, HEADERS.length).setValues([ticketToRow(ticket)]);
  }
  colorRow(sheet, ticket);
}

function colorRow(sheet, ticket) {
  const row = findRowById(sheet, ticket.id);
  if (row === -1) return;
  const range = sheet.getRange(row, 1, 1, HEADERS.length);
  if (ticket.status === 'Resolved') {
    range.setBackground('#1a2a1a');
    range.setFontColor('#666');
  } else if (ticket.priority === 'high') {
    range.setBackground('#2a1a1a');
    range.setFontColor('#f0ede8');
  } else if (ticket.priority === 'medium') {
    range.setBackground('#2a2010');
    range.setFontColor('#f0ede8');
  } else {
    range.setBackground('#ffffff');
    range.setFontColor('#111');
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    if (body.action === 'upsert') {
      upsertTicket(sheet, body.ticket);
    } else if (body.action === 'syncAll') {
      // Clear existing data rows (keep header)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
      // Re-add all
      body.tickets.forEach(t => sheet.appendRow(ticketToRow(t)));
      // Color rows
      body.tickets.forEach(t => colorRow(sheet, t));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET for connection testing
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Art Tickets sync active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
