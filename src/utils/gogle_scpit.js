function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = JSON.parse(e.postData.contents);

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getDataRange().getValues().slice(1); // exclude headers

  // Helper to get column index by header name
  const getColIndex = (name) => headers.indexOf(name);

  if (data.action === "register") {
    const emailIndex = getColIndex("Email");
    const isDuplicate = rows.some(row => row[emailIndex] === data.email);

    if (isDuplicate) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Email already exists"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Create new row in correct header order
    const newRow = headers.map(header => data[header.toLowerCase()] || "");

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registered successfully"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === "login") {
    const emailIndex = getColIndex("Email");
    const passwordIndex = getColIndex("Password");

    const user = rows.find(row => row[emailIndex] === data.email && row[passwordIndex] === data.password);

    if (user) {
      const userObj = {};
      headers.forEach((header, index) => {
        userObj[header.toLowerCase()] = user[index];
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Login successful",
        user: userObj
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid credentials"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Invalid action"
  })).setMimeType(ContentService.MimeType.JSON);
}





