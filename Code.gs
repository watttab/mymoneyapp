function doPost(e) {
  var ss = SpreadsheetApp.openById("197zNg_0avra8C78Xe8vLiZsjlQVLeDx2j2Si8yJX1GM");
  
  try {
    var date = e.parameter.date;
    var category = e.parameter.category;
    var type = e.parameter.type;
    var amount = parseFloat(e.parameter.amount);
    var note = e.parameter.note;
    
    // เลือกชีทตามหมวดหมู่ที่เลือกมาจากฟอร์ม (เช่น "เงินเก็บ" หรือ "ค่าเทอมลูก")
    var sheet = ss.getSheetByName(category);
    
    // ถ้าไม่มีชีทชื่อนั้น ให้กลับไปใช้ชีทแรกสุดเป็นค่าเริ่มต้น
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    
    // Adjust amount based on income/expense
    if (type === "expense") {
      amount = -amount;
    }
    
    // Add row: [Timestamp, Date, หมวดหมู่, Amount, Note]
    sheet.appendRow([new Date(), date, category, amount, note]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// ฟังก์ชันสำหรับ Setup Google Sheet ครั้งแรก
// ==========================================
function setupSheet() {
  var ss = SpreadsheetApp.openById("197zNg_0avra8C78Xe8vLiZsjlQVLeDx2j2Si8yJX1GM");
  
  // รายชื่อชีทที่ต้องการสร้าง
  var sheetNames = ["เงินเก็บ", "ค่าเทอมลูก"];
  
  for (var i = 0; i < sheetNames.length; i++) {
    var name = sheetNames[i];
    var sheet = ss.getSheetByName(name);
    
    // ถ้ายังไม่มีชีทนี้ ให้สร้างใหม่
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    // 1. สร้าง Headers
    var headers = [["Timestamp", "วันที่", "หมวดหมู่", "จำนวนเงิน", "บันทึกเพิ่มเติม"]];
    sheet.getRange("A1:E1").setValues(headers);
    
    // 2. ตกแต่ง Headers ให้สวยงาม
    var headerRange = sheet.getRange("A1:E1");
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4f46e5"); // สีม่วงเข้ม (Primary color ของเว็บ)
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    
    // 3. กำหนดความกว้างของคอลัมน์
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 120); // Date
    sheet.setColumnWidth(3, 150); // Category
    sheet.setColumnWidth(4, 120); // Amount
    sheet.setColumnWidth(5, 300); // Note
    
    // 4. แช่แข็งแถวแรก (Freeze Top Row)
    sheet.setFrozenRows(1);
    
    // 5. จัดรูปแบบคอลัมน์ "จำนวนเงิน" (คอลัมน์ D) ให้เป็นตัวเลขมีคอมม่าและทศนิยม
    sheet.getRange("D2:D").setNumberFormat("#,##0.00");
  }
  
  // หากมีชีทชื่อ "แผ่นที่ 1" (หรือ Sheet1) ที่ไม่ได้ใช้ สามารถเก็บไว้หรือลบทิ้งด้วยมือได้
  Logger.log("✅ Setup Google Sheet ทั้ง 2 หมวดหมู่เสร็จสมบูรณ์!");
}
