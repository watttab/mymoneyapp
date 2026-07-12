function doPost(e) {
  var sheet = SpreadsheetApp.openById("197zNg_0avra8C78Xe8vLiZsjlQVLeDx2j2Si8yJX1GM").getActiveSheet();
  
  try {
    var date = e.parameter.date;
    var category = e.parameter.category;
    var type = e.parameter.type;
    var amount = parseFloat(e.parameter.amount);
    var note = e.parameter.note;
    
    // Adjust amount based on income/expense
    if (type === "expense") {
      amount = -amount;
    }
    
    // Add row: [Timestamp, Date, Category, Amount, Note]
    sheet.appendRow([new Date(), date, category, amount, note]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Enable CORS for simple GET if needed
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// ฟังก์ชันสำหรับ Setup Google Sheet ครั้งแรก
// ==========================================
function setupSheet() {
  var ss = SpreadsheetApp.openById("197zNg_0avra8C78Xe8vLiZsjlQVLeDx2j2Si8yJX1GM");
  var sheet = ss.getActiveSheet();
  
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
  
  Logger.log("✅ Setup Google Sheet เสร็จสมบูรณ์!");
}
