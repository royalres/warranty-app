const GOLD = "#c9a84c";
const DARK2 = "#0d1f3c";
const BORDER = "#1e3a5f";
const TEXT = "#e8edf5";
const TEXT2 = "#7a9cc0";

export default function PrivacyPolicy({ onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: DARK2, borderRadius: 10, border: "1px solid " + BORDER,
        borderTop: "2px solid " + GOLD, maxWidth: 680, width: "100%",
        maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid " + BORDER, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: "0.1em" }}>◆ นโยบายความเป็นส่วนตัว</div>
            <div style={{ fontSize: 11, color: TEXT2, marginTop: 4, letterSpacing: "0.05em" }}>Privacy Policy — Royal Engineering Service Co., Ltd.</div>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "1px solid " + BORDER, color: TEXT2, padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
            ✕ ปิด
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", overflowY: "auto", fontSize: 14, lineHeight: 1.8, color: TEXT }}>

          <p style={{ color: TEXT2, fontSize: 12, marginBottom: 24 }}>
            มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2568 | ปรับปรุงล่าสุด: 15 มิถุนายน 2568
          </p>

          <Section title="1. ข้อมูลทั่วไป">
            บริษัท รอยัล เอ็นจิเนียริ่ง เซอร์วิส จำกัด ("บริษัท") ในฐานะผู้ควบคุมข้อมูลส่วนบุคคล
            มีความมุ่งมั่นในการคุ้มครองข้อมูลส่วนบุคคลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
            พ.ศ. 2562 (PDPA) นโยบายนี้อธิบายถึงการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน
          </Section>

          <Section title="2. ข้อมูลที่เราเก็บรวบรวม">
            <b style={{ color: GOLD }}>2.1 บุคคลทั่วไป</b><br />
            • ชื่อ-นามสกุล<br />
            • เลขบัตรประจำตัวประชาชน<br />
            • ที่อยู่<br />
            • เบอร์โทรศัพท์<br />
            • อีเมล<br /><br />
            <b style={{ color: GOLD }}>2.2 นิติบุคคล / บริษัท</b><br />
            • ชื่อบริษัท และประเภทบริษัท<br />
            • เลขประจำตัวผู้เสียภาษี<br />
            • ที่อยู่สำนักงาน<br />
            • ข้อมูลผู้ติดต่อ<br /><br />
            <b style={{ color: GOLD }}>2.3 ข้อมูลสินค้า</b><br />
            • ประเภทและรุ่นสินค้า<br />
            • เลขซีเรียล<br />
            • วันที่ซื้อและเลขที่ใบกำกับภาษี
          </Section>

          <Section title="3. วัตถุประสงค์การเก็บข้อมูล">
            บริษัทเก็บรวบรวมข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ดังต่อไปนี้<br /><br />
            • <b>การรับประกันสินค้า</b> — เพื่อลงทะเบียนและดำเนินการรับประกันสินค้าที่ท่านซื้อ<br />
            • <b>การติดต่อสื่อสาร</b> — เพื่อแจ้งข้อมูลเกี่ยวกับสินค้า บริการ และการบำรุงรักษา<br />
            • <b>การบำรุงรักษา (PM)</b> — เพื่อนัดหมายและติดตามการบำรุงรักษาสินค้า<br />
            • <b>การปฏิบัติตามกฎหมาย</b> — เพื่อปฏิบัติตามข้อกำหนดทางกฎหมายที่เกี่ยวข้อง
          </Section>

          <Section title="4. ระยะเวลาการเก็บข้อมูล">
            บริษัทจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตลอดระยะเวลาที่จำเป็นเพื่อบรรลุวัตถุประสงค์
            ที่ระบุไว้ในนโยบายนี้ หรือตามที่กฎหมายกำหนด โดยทั่วไปไม่เกิน <b style={{ color: GOLD }}>10 ปี</b>
            นับจากวันที่หมดอายุการรับประกันสินค้า
          </Section>

          <Section title="5. การเปิดเผยข้อมูล">
            บริษัทจะไม่เปิดเผย ขาย หรือถ่ายโอนข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก
            ยกเว้นในกรณีดังต่อไปนี้<br /><br />
            • ได้รับความยินยอมจากท่านอย่างชัดแจ้ง<br />
            • เป็นการปฏิบัติตามคำสั่งของหน่วยงานรัฐหรือกฎหมาย<br />
            • ผู้ให้บริการภายนอกที่จำเป็นสำหรับการดำเนินธุรกิจ (ภายใต้สัญญาคุ้มครองข้อมูล)
          </Section>

          <Section title="6. ความปลอดภัยของข้อมูล">
            บริษัทใช้มาตรการรักษาความปลอดภัยที่เหมาะสม ได้แก่<br /><br />
            • การเข้ารหัสข้อมูลระหว่างการส่งผ่าน (SSL/TLS)<br />
            • การควบคุมการเข้าถึงข้อมูลตามระดับสิทธิ์<br />
            • ระบบฐานข้อมูลที่ได้มาตรฐานความปลอดภัยสากล (Supabase)<br />
            • การตรวจสอบและบันทึกการเข้าถึงข้อมูล
          </Section>

          <Section title="7. สิทธิ์ของเจ้าของข้อมูล">
            ท่านมีสิทธิ์ดังต่อไปนี้ภายใต้ PDPA<br /><br />
            • <b>สิทธิ์ในการเข้าถึง</b> — ขอดูข้อมูลส่วนบุคคลของท่านได้<br />
            • <b>สิทธิ์ในการแก้ไข</b> — ขอแก้ไขข้อมูลที่ไม่ถูกต้องได้<br />
            • <b>สิทธิ์ในการลบ</b> — ขอลบข้อมูลส่วนบุคคลได้ (ภายใต้เงื่อนไขทางกฎหมาย)<br />
            • <b>สิทธิ์ในการถอนความยินยอม</b> — ถอนความยินยอมได้ทุกเมื่อ<br />
            • <b>สิทธิ์ในการร้องเรียน</b> — ร้องเรียนต่อสำนักงาน PDPA ได้
          </Section>

          <Section title="8. การติดต่อ">
            หากท่านมีคำถามหรือต้องการใช้สิทธิ์ตาม PDPA กรุณาติดต่อ<br /><br />
            <b style={{ color: GOLD }}>บริษัท รอยัล เอ็นจิเนียริ่ง เซอร์วิส จำกัด</b><br />
            อีเมล: res@royalres.co.th<br />
            เว็บไซต์: royalres.co.th<br /><br />
            <span style={{ color: TEXT2, fontSize: 12 }}>
              * บริษัทจะดำเนินการตามคำขอของท่านภายใน 30 วันนับจากวันที่ได้รับคำขอ
            </span>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c", letterSpacing: "0.06em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #1e3a5f" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.9, color: "#e8edf5" }}>{children}</div>
    </div>
  );
}