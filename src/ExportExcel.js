export function exportToCSV(records) {
  const headers = [
    "รหัส", "ประเภท", "ชื่อ-นามสกุล/บริษัท", "เบอร์โทร", "อีเมล", "ที่อยู่",
    "เลขบัตรประชาชน", "เลขผู้เสียภาษี",
    "สินค้า", "ยี่ห้อ", "รุ่น", "เลขซีเรียล", "วันที่ซื้อ", "ระยะประกัน (เดือน)",
    "วันหมดประกัน", "เลขที่ใบกำกับภาษี", "PM", "กำหนด PM ครั้งถัดไป", "ผู้รับผิดชอบ PM"
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

  function nearestPM(pm) {
    if (!pm || !pm.schedules || pm.schedules.length === 0) return "-";
    const dates = pm.schedules.map(s => s.date).filter(Boolean).sort();
    return dates[0] || "-";
  }

  function nearestAssignee(pm) {
    if (!pm || !pm.schedules || pm.schedules.length === 0) return "-";
    const sorted = pm.schedules.filter(s => s.date).sort((a, b) => a.date.localeCompare(b.date));
    return sorted[0]?.assignee || "-";
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
      r.pm?.required ? "ต้องการ PM" : "ไม่มี PM",
      nearestPM(r.pm), nearestAssignee(r.pm)
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