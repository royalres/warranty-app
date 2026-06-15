export function exportToCSV(records) {
  const headers = [
    "รหัส", "ประเภท", "ชื่อ-นามสกุล/บริษัท", "เบอร์โทร", "อีเมล", "ที่อยู่",
    "เลขบัตรประชาชน", "เลขผู้เสียภาษี",
    "สินค้า", "ยี่ห้อ", "รุ่น", "เลขซีเรียล", "วันที่ซื้อ", "ระยะประกัน (เดือน)",
    "วันหมดประกัน", "เลขที่ใบกำกับภาษี", "สถานที่ติดตั้ง", "ต้องการ PM",
    "PM ครั้งที่ 1 วันที่", "PM ครั้งที่ 1 ผู้รับผิดชอบ", "PM ครั้งที่ 1 หมายเหตุ",
    "PM ครั้งที่ 2 วันที่", "PM ครั้งที่ 2 ผู้รับผิดชอบ", "PM ครั้งที่ 2 หมายเหตุ",
    "PM ครั้งที่ 3 วันที่", "PM ครั้งที่ 3 ผู้รับผิดชอบ", "PM ครั้งที่ 3 หมายเหตุ",
    "PM ครั้งที่ 4 วันที่", "PM ครั้งที่ 4 ผู้รับผิดชอบ", "PM ครั้งที่ 4 หมายเหตุ",
    "PM ครั้งที่ 5 วันที่", "PM ครั้งที่ 5 ผู้รับผิดชอบ", "PM ครั้งที่ 5 หมายเหตุ",
  ];

  function fmtAddr(a) {
    if (!a) return "-";
    return [a.address1, a.subdistrict, a.district, a.province, a.postcode].filter(Boolean).join(" ");
  }

  function expDate(purchaseDate, months) {
    const d = new Date(purchaseDate);
    d.setMonth(d.getMonth() + Number(months));
    return d.toLocaleDateString("th-TH");
  }

  function pmColumns(pm) {
    const cols = [];
    for (let i = 0; i < 20; i++) {
      const s = pm?.schedules?.[i];
      cols.push(s?.date || "-");
      cols.push(s?.assignee || "-");
      cols.push(s?.note || "-");
    }
    return cols;
  }

  const rows = records.map(r => {
    const name = r.type === "personal"
      ? (r.firstName || "") + " " + (r.lastName || "")
      : (r.companyName || "");
    const phone = r.type === "personal" ? (r.phone || "-") : (r.companyPhone || "-");
    const email = r.type === "personal" ? (r.email || "-") : (r.companyEmail || "-");
    const addr = r.type === "personal" ? fmtAddr(r.addr) : fmtAddr(r.companyAddr);
    const brand = r.brand === "Other" ? (r.brandOther || "Other") : (r.brand || "-");

    // ใส่ apostrophe นำหน้าตัวเลขยาว เพื่อบังคับ Excel แสดงเป็น Text
    const idCard = r.idCard ? `'${r.idCard}` : "-";
    const taxId = r.taxId ? `'${r.taxId}` : "-";

    return [
      r.id, r.type === "personal" ? "บุคคลทั่วไป" : "บริษัท",
      name.trim(), phone, email, addr,
      idCard, taxId,
      r.productType || "-", brand, r.model || "-", r.serial || "-",
      r.purchaseDate || "-", r.warrantyMonths || "-",
      r.purchaseDate ? expDate(r.purchaseDate, r.warrantyMonths) : "-",
      r.receipt || "-",
      r.installationSite || "-",
      r.pm?.required ? "ต้องการ PM" : "ไม่มี PM",
      ...pmColumns(r.pm)
    ].map(v => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csvContent = [headers.map(h => `"${h}"`), ...rows].map(r => r.join(",")).join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "warranty_report_" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}