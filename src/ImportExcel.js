import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";

const GOLD = "#c9a84c";
const DARK = "#0a1628";
const DARK2 = "#0d1f3c";
const DARK3 = "#112244";
const BORDER = "#1e3a5f";
const TEXT = "#e8edf5";
const TEXT2 = "#7a9cc0";

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 6,
  border: "1px solid " + BORDER, background: DARK3,
  color: TEXT, fontSize: 14, boxSizing: "border-box",
};

function genId() { return "WR" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100); }

// แปลงวันที่จาก Excel หลายรูปแบบ
function parseDate(val) {
  if (!val) return "";
  // Excel serial number
  if (typeof val === "number") {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  // String format DD/MM/YYYY
  if (typeof val === "string") {
    const parts = val.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      const year = y.length === 2 ? "25" + y : y;
      // แปลงปี พ.ศ. เป็น ค.ศ.
      const yearNum = parseInt(year);
      const adYear = yearNum > 2500 ? yearNum - 543 : yearNum;
      return `${adYear}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    }
    // YYYY-MM-DD
    if (val.match(/^\d{4}-\d{2}-\d{2}/)) return val.split("T")[0];
  }
  return String(val);
}

// แปลงระยะเวลารับประกัน
function parseWarranty(val) {
  if (!val) return 12;
  const str = String(val).toLowerCase();
  if (str.includes("ปี") || str.includes("year")) {
    const num = parseFloat(str);
    return Math.round(num * 12);
  }
  if (str.includes("เดือน") || str.includes("month")) return parseInt(str);
  return parseInt(str) || 12;
}

// แปลง row Excel เป็น format ของระบบ
function rowToRecord(row) {
  const id = genId();
  const type = String(row["ประเภท"] || row["type"] || "personal").toLowerCase().includes("บริษัท") || 
               String(row["ประเภท"] || row["type"] || "").toLowerCase().includes("company") 
               ? "company" : "personal";

  return {
    id,
    type,
    // บุคคลทั่วไป
    first_name: String(row["ชื่อ"] || row["first_name"] || ""),
    last_name: String(row["นามสกุล"] || row["last_name"] || ""),
    id_card: String(row["เลขบัตรประชาชน"] || row["id_card"] || ""),
    phone: String(row["เบอร์โทร"] || row["phone"] || ""),
    email: String(row["อีเมล"] || row["email"] || ""),
    addr: {
      address1: String(row["ที่อยู่"] || row["address1"] || ""),
      subdistrict: String(row["แขวง/ตำบล"] || row["subdistrict"] || ""),
      district: String(row["เขต/อำเภอ"] || row["district"] || ""),
      province: String(row["จังหวัด"] || row["province"] || ""),
      postcode: String(row["รหัสไปรษณีย์"] || row["postcode"] || ""),
    },
    // บริษัท
    company_type: String(row["ประเภทบริษัท"] || row["company_type"] || ""),
    company_name: String(row["ชื่อบริษัท"] || row["company_name"] || ""),
    branch_type: String(row["ประเภทสาขา"] || row["branch_type"] || "HQ"),
    branch_no: String(row["เลขที่สาขา"] || row["branch_no"] || ""),
    tax_id: String(row["เลขผู้เสียภาษี"] || row["tax_id"] || ""),
    company_phone: String(row["เบอร์บริษัท"] || row["company_phone"] || ""),
    contact_first_name: String(row["ชื่อผู้ติดต่อ"] || row["contact_first_name"] || ""),
    contact_last_name: String(row["นามสกุลผู้ติดต่อ"] || row["contact_last_name"] || ""),
    company_email: String(row["อีเมลบริษัท"] || row["company_email"] || ""),
    company_addr: {
      address1: String(row["ที่อยู่บริษัท"] || row["company_address1"] || ""),
      subdistrict: String(row["แขวง/ตำบลบริษัท"] || row["company_subdistrict"] || ""),
      district: String(row["เขต/อำเภอบริษัท"] || row["company_district"] || ""),
      province: String(row["จังหวัดบริษัท"] || row["company_province"] || ""),
      postcode: String(row["รหัสไปรษณีย์บริษัท"] || row["company_postcode"] || ""),
    },
    // สินค้า
    product_type: String(row["ประเภทสินค้า"] || row["product_type"] || "Others"),
    brand: String(row["ยี่ห้อ"] || row["brand"] || "Other"),
    brand_other: String(row["ยี่ห้ออื่นๆ"] || row["brand_other"] || ""),
    serial: String(row["เลขซีเรียล"] || row["serial"] || ""),
    model: String(row["รุ่นสินค้า"] || row["model"] || ""),
    purchase_date: parseDate(row["วันที่ซื้อ"] || row["purchase_date"]),
    warranty_months: parseWarranty(row["ระยะประกัน"] || row["warranty_months"]),
    receipt: String(row["เลขใบกำกับภาษี"] || row["receipt"] || ""),
    pm: { required: false, schedules: [] },
    pdpa_consent: true,
    pdpa_consent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

export default function ImportExcel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const records = rows.map(rowToRecord);
      setPreview(records);
    };
    reader.readAsBinaryString(f);
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    setErrors([]);

    const errs = [];
    let success = 0;

    // Import ทีละ 50 แถว
    const chunkSize = 50;
    for (let i = 0; i < preview.length; i += chunkSize) {
      const chunk = preview.slice(i, i + chunkSize);
      const { error } = await supabase.from("registrations").insert(chunk);
      if (error) {
        errs.push(`แถว ${i + 1}-${i + chunk.length}: ${error.message}`);
      } else {
        success += chunk.length;
      }
    }

    setResult({ success, failed: preview.length - success });
    setErrors(errs);
    setImporting(false);
    if (errs.length === 0) {
      setPreview([]);
      setFile(null);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
        ◆ IMPORT EXCEL / CSV
      </div>

      {/* Upload Zone */}
      <div style={{ background: DARK2, borderRadius: 8, padding: "24px", border: "2px dashed " + BORDER, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14, color: TEXT, marginBottom: 16 }}>Upload ไฟล์ Excel (.xlsx) หรือ CSV (.csv)</div>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
          style={{ display: "none" }} id="excel-upload" />
        <label htmlFor="excel-upload"
          style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: GOLD, color: DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.08em" }}>
          เลือกไฟล์
        </label>
        {file && <div style={{ marginTop: 12, fontSize: 13, color: GOLD }}>✓ {file.name}</div>}
      </div>

      {/* Column Mapping Guide */}
      <div style={{ background: DARK2, borderRadius: 8, padding: "16px 20px", marginBottom: 20, border: "1px solid " + BORDER }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 12, letterSpacing: "0.08em" }}>◆ ชื่อ Column ที่รองรับ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: TEXT2 }}>
          {[
            ["ชื่อ Column ภาษาไทย", "ชื่อ Column ภาษาอังกฤษ"],
            ["ประเภท", "type"],
            ["ชื่อ", "first_name"],
            ["นามสกุล", "last_name"],
            ["เลขบัตรประชาชน", "id_card"],
            ["เบอร์โทร", "phone"],
            ["อีเมล", "email"],
            ["ที่อยู่", "address1"],
            ["แขวง/ตำบล", "subdistrict"],
            ["เขต/อำเภอ", "district"],
            ["จังหวัด", "province"],
            ["รหัสไปรษณีย์", "postcode"],
            ["ชื่อบริษัท", "company_name"],
            ["เลขผู้เสียภาษี", "tax_id"],
            ["ประเภทสินค้า", "product_type"],
            ["ยี่ห้อ", "brand"],
            ["เลขซีเรียล", "serial"],
            ["รุ่นสินค้า", "model"],
            ["วันที่ซื้อ", "purchase_date"],
            ["ระยะประกัน", "warranty_months"],
            ["เลขใบกำกับภาษี", "receipt"],
          ].map(([th, en], i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: i === 0 ? "1px solid " + BORDER : "none",
              fontWeight: i === 0 ? 700 : 400, color: i === 0 ? GOLD : TEXT2 }}>
              <span style={{ flex: 1 }}>{th}</span>
              <span style={{ flex: 1, fontFamily: "monospace" }}>{en}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>◆ Preview — {preview.length} รายการ</div>
            <button onClick={handleImport} disabled={importing}
              style={{ padding: "10px 24px", borderRadius: 6, border: "none", background: importing ? DARK3 : GOLD, color: importing ? TEXT2 : DARK, fontWeight: 700, fontSize: 12, cursor: importing ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}>
              {importing ? "IMPORTING..." : `IMPORT ${preview.length} รายการ`}
            </button>
          </div>

          <div style={{ borderRadius: 8, border: "1px solid " + BORDER, overflow: "auto", maxHeight: 400 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: DARK3 }}>
                  {["#", "ประเภท", "ชื่อ/บริษัท", "สินค้า", "ยี่ห้อ", "ซีเรียล", "วันที่ซื้อ", "ระยะประกัน"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 12px", textAlign: "left", color: GOLD, fontWeight: 700, borderBottom: "1px solid " + BORDER, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? DARK2 : DARK3 }}>
                    <td style={{ padding: "8px 12px", color: TEXT2 }}>{i + 1}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.type === "personal" ? "บุคคล" : "บริษัท"}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.type === "personal" ? `${r.first_name} ${r.last_name}` : r.company_name}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.product_type}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.brand}</td>
                    <td style={{ padding: "8px 12px", color: TEXT, fontFamily: "monospace" }}>{r.serial}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.purchase_date}</td>
                    <td style={{ padding: "8px 12px", color: TEXT }}>{r.warranty_months} เดือน</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && (
              <div style={{ padding: "10px 14px", color: TEXT2, fontSize: 12, textAlign: "center", borderTop: "1px solid " + BORDER }}>
                แสดง 20 จาก {preview.length} รายการ
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ padding: "16px 20px", borderRadius: 8, background: result.failed === 0 ? "#0d2818" : "#2d1a00", border: "1px solid " + (result.failed === 0 ? "#166534" : "#4a3000") }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: result.failed === 0 ? "#4ade80" : GOLD, marginBottom: 8 }}>
            {result.failed === 0 ? "✓ Import สำเร็จทั้งหมด!" : "⚠ Import เสร็จสิ้น (มีบางรายการที่ไม่สำเร็จ)"}
          </div>
          <div style={{ fontSize: 13, color: TEXT2 }}>
            ✓ สำเร็จ: {result.success} รายการ {result.failed > 0 && `| ✗ ไม่สำเร็จ: ${result.failed} รายการ`}
          </div>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>{e}</div>
          ))}
        </div>
      )}
    </div>
  );
}