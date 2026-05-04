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
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1a1a2e');
    headerRange.setFontColor('#e8d5a3');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 50);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 280);
    sheet.setColumnWidth(4, 80);
    sheet.setColumnWidth(5, 90);
    sheet.setColumnWidth(6, 120);
    sheet.setColumnWidth(7, 80);
    sheet.setColumnWidth(8, 140);
    sheet.setColumnWidth(9, 140);
  }
  return sheet;
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
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
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
      body.tickets.forEach(t => sheet.appendRow(ticketToRow(t)));
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

// GET handler — connection test OR fetch all tickets for two-way sync
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getAll') {
    try {
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, tickets: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const tickets = data.slice(1).map(function(row) {
        return {
          id:        String(row[0]),
          title:     String(row[1] || ''),
          desc:      String(row[2] || ''),
          priority:  String(row[3] || 'medium'),
          category:  String(row[4] || 'other'),
          requester: String(row[5] || ''),
          status:    String(row[6] || 'Open'),
          created:   String(row[7] || ''),
          updated:   String(row[8] || ''),
          done:      row[6] === 'Resolved',
          ts:        new Date().getTime()
        };
      });
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, tickets: tickets }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Default: connection test
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Art Tickets sync active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
