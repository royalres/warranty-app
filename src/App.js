import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "warranty_registrations";
function genId() { return "WR" + Date.now().toString().slice(-8); }
function daysLeft(purchaseDate, months) {
  const exp = new Date(purchaseDate);
  exp.setMonth(exp.getMonth() + Number(months));
  return Math.ceil((exp - new Date()) / 86400000);
}
function pmDaysLeft(pmDate) {
  if (!pmDate) return null;
  return Math.ceil((new Date(pmDate) - new Date()) / 86400000);
}

const T = {
  th: {
    appTitle: "Royal Group", appSub: "ระบบรับประกันสินค้า | Warranty Registration",
    navRegister: "ลงทะเบียน", navCheck: "ตรวจสอบ", navAdmin: "แอดมิน",
    personal: "บุคคลทั่วไป", company: "นิติบุคคล / บริษัท",
    sectionPersonal: "ข้อมูลบุคคลทั่วไป", sectionCompany: "ข้อมูลบริษัท", sectionProduct: "ข้อมูลสินค้า",
    firstName: "ชื่อ", lastName: "นามสกุล", idCard: "เลขบัตรประจำตัวประชาชน",
    phone: "เบอร์โทรศัพท์", email: "อีเมล",
    address: "ที่อยู่", address1: "บ้านเลขที่, หมู่, ถนน, ซอย และอื่นๆ",
    subdistrict: "แขวง / ตำบล", district: "เขต / อำเภอ", province: "จังหวัด", postcode: "รหัสไปรษณีย์",
    companyType: "ประเภทบริษัท", companyName: "ชื่อบริษัท", branchType: "ประเภทสำนักงาน",
    hq: "สำนักงานใหญ่", branch: "สาขา", branchNo: "เลขที่สาขา",
    taxId: "เลขผู้เสียภาษี (13 หลัก)", contactName: "ชื่อ - นามสกุลผู้ติดต่อ",
    productType: "สินค้า", brand: "ยี่ห้อ", brandOther: "ระบุยี่ห้อ",
    serial: "เลขซีเรียล", model: "รุ่นสินค้า", purchaseDate: "วันที่ซื้อ",
    warrantyMonths: "ระยะเวลารับประกัน",     receipt: "เลขที่ใบกำกับภาษี",
    receiptNote: "สำหรับสั่งซื้อ Online เช่น Shopee, TikTok, Lazada ที่ไม่มีเลขที่ใบกำกับภาษี ให้ระบุหมายเลขคำสั่งซื้อแทน",
    submitBtn: "ลงทะเบียนรับประกัน",
    successMsg: (id) => `✓ ลงทะเบียนสำเร็จ! รหัส: ${id}`,
    selectProductType: "-- เลือกประเภทสินค้า --", selectBrand: "-- เลือกยี่ห้อ --",
    selectCompanyType: "-- เลือกประเภทบริษัท --",
    checkTitle: "ตรวจสอบสถานะการรับประกัน",     checkPlaceholder: "กรอกเลขซีเรียล หรือ เลขที่ใบกำกับภาษี หรือ หมายเลขคำสั่งซื้อ",
    checkBtn: "ตรวจสอบ", notFound: "ไม่พบข้อมูลการลงทะเบียนสำหรับเลขซีเรียลหรือเลขที่ใบกำกับภาษีนี้",
    registrant: "ผู้ลงทะเบียน", regCode: "รหัสการลงทะเบียน", buyDate: "วันที่ซื้อ", expDate: "หมดประกัน",
    adminPin: "รหัสผ่านแอดมิน", pinPlaceholder: "รหัสผ่าน (ค่าเริ่มต้น: 1234)",
    loginBtn: "เข้าสู่ระบบ", wrongPin: "รหัสผ่านไม่ถูกต้อง",
    totalReg: "ลงทะเบียนทั้งหมด", nearExpire: "ใกล้หมดประกัน", expired: "หมดประกันแล้ว",
    pmDue: "PM ถึงกำหนด",
    searchPlaceholder: "ค้นหา ชื่อ, ซีเรียล, รุ่น, รหัส...",
    colCode: "รหัส", colName: "ชื่อ / บริษัท", colModel: "รุ่นสินค้า", colSerial: "ซีเรียล", colStatus: "สถานะ",
    noData: "ไม่พบข้อมูล", showing: (f,t) => `แสดง ${f} จาก ${t} รายการ`,
    back: "กลับ", detailProduct: "ข้อมูลสินค้า", save: "บันทึก", cancel: "ยกเลิก",
    statusActive: (d) => `ใช้งานได้ ${d} วัน`, statusNear: (d) => `ใกล้หมด ${d} วัน`, statusExp: "หมดประกัน",
    fldCompanyType: "ประเภทบริษัท", fldCompany: "บริษัท", fldBranch: "ประเภทสำนักงาน",
    fldTax: "เลขผู้เสียภาษี", fldPhone: "เบอร์โทร", fldContact: "ผู้ติดต่อ",
    fldEmail: "อีเมล", fldAddress: "ที่อยู่", fldName: "ชื่อ-นามสกุล", fldIdCard: "เลขบัตรประชาชน",
    fldProduct: "สินค้า", fldBrand: "ยี่ห้อ", fldModel: "รุ่นสินค้า", fldSerial: "เลขซีเรียล",
    fldPurchase: "วันที่ซื้อ", fldWarranty: "ระยะรับประกัน", fldExpire: "วันหมดประกัน",     fldReceipt: "เลขที่ใบกำกับภาษี",
    months: (n) => `${n} เดือน`, years: (n) => `${n} ปี`,
    errPersonal: "กรุณากรอกข้อมูลให้ครบ (ชื่อ, นามสกุล, เลขบัตร, เบอร์โทร)",
    errIdCard: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก",
    errCompany: "กรุณากรอกข้อมูลบริษัทให้ครบ", errTaxId: "เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก",
    errProduct: "กรุณากรอกข้อมูลสินค้าให้ครบ",
    otherBrand: "Other อื่นๆโปรดระบุ", specifyBrand: "กรอกยี่ห้อสินค้า",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "รุ่นสินค้า",     receiptPlaceholder: "TIV-XXXXX หรือ RT-XXXXX",
    branchNoPlaceholder: "เช่น 00001", contactFirstPlaceholder: "ชื่อ", contactLastPlaceholder: "นามสกุล",
    companyNamePlaceholder: "ชื่อบริษัท / ห้างร้าน", address1Placeholder: "บ้านเลขที่, หมู่, ถนน, ซอย และอื่นๆ",
    subdistrictPlaceholder: "พิมพ์เพื่อค้นหา", districtPlaceholder: "พิมพ์เพื่อค้นหา",
    provincePlaceholder: "พิมพ์เพื่อค้นหา", postcodePlaceholder: "XXXXX",
    pmSection: "การบำรุงรักษา (PM)", pmRequired: "ต้องการ PM", pmNotRequired: "ไม่ต้องการ PM",
    pmDate: "กำหนด PM ครั้งถัดไป", pmNote: "หมายเหตุ PM", pmAssign: "ผู้รับผิดชอบ PM",
    pmStatus: "สถานะ PM", pmSaved: "บันทึก PM เรียบร้อย",
    pmOverdue: "PM เกินกำหนด", pmSoon: (d) => `PM ใน ${d} วัน`, pmOk: (d) => `PM อีก ${d} วัน`, pmNone: "ไม่มี PM",
    tabInfo: "ข้อมูล", tabPM: "PM",
    filterAll: "ทั้งหมด", filterPMDue: "PM ถึงกำหนด", filterNearExp: "ใกล้หมดประกัน", filterExpired: "หมดประกัน",
  },
  en: {
    appTitle: "Royal Group", appSub: "Warranty Registration System",
    navRegister: "Register", navCheck: "Check Status", navAdmin: "Admin",
    personal: "Individual", company: "Company / Business",
    sectionPersonal: "Personal Information", sectionCompany: "Company Information", sectionProduct: "Product Information",
    firstName: "First Name", lastName: "Last Name", idCard: "National ID Card",
    phone: "Phone Number", email: "Email",
    address: "Address", address1: "House No., Village, Road, Lane, etc.",
    subdistrict: "Sub-district", district: "District", province: "Province", postcode: "Postal Code",
    companyType: "Company Type", companyName: "Company Name", branchType: "Office Type",
    hq: "Head Office", branch: "Branch", branchNo: "Branch Number",
    taxId: "Tax ID (13 digits)", contactName: "Contact Person Name",
    productType: "Product", brand: "Brand", brandOther: "Specify Brand",
    serial: "Serial Number", model: "Model", purchaseDate: "Purchase Date",
    warrantyMonths: "Warranty Period",     receipt: "Receipt / Tax Invoice Number",
    receiptNote: "For online orders (Shopee, TikTok, Lazada) without a tax invoice number, please enter your order number instead.",
    submitBtn: "Register Warranty",
    successMsg: (id) => `✓ Registration successful! Code: ${id}`,
    selectProductType: "-- Select Product --", selectBrand: "-- Select Brand --",
    selectCompanyType: "-- Select Company Type --",
    checkTitle: "Check Warranty Status",     checkPlaceholder: "Enter serial number, tax invoice number, or order number",
    checkBtn: "Check", notFound: "No registration found for this serial number or tax invoice number.",
    registrant: "Registrant", regCode: "Registration Code", buyDate: "Purchase Date", expDate: "Expires",
    adminPin: "Admin Password", pinPlaceholder: "Password (default: 1234)",
    loginBtn: "Login", wrongPin: "Incorrect password",
    totalReg: "Total Registrations", nearExpire: "Expiring Soon", expired: "Expired", pmDue: "PM Due",
    searchPlaceholder: "Search name, serial, model, code...",
    colCode: "Code", colName: "Name / Company", colModel: "Model", colSerial: "Serial", colStatus: "Status",
    noData: "No data found", showing: (f,t) => `Showing ${f} of ${t} records`,
    back: "Back", detailProduct: "Product Details", save: "Save", cancel: "Cancel",
    statusActive: (d) => `Active – ${d} days left`, statusNear: (d) => `Expiring in ${d} days`, statusExp: "Expired",
    fldCompanyType: "Company Type", fldCompany: "Company", fldBranch: "Office Type",
    fldTax: "Tax ID", fldPhone: "Phone", fldContact: "Contact Person",
    fldEmail: "Email", fldAddress: "Address", fldName: "Full Name", fldIdCard: "National ID",
    fldProduct: "Product", fldBrand: "Brand", fldModel: "Model", fldSerial: "Serial No.",
    fldPurchase: "Purchase Date", fldWarranty: "Warranty Period", fldExpire: "Expiry Date",     fldReceipt: "Receipt / Tax Invoice No.",
    months: (n) => `${n} Month${n>1?"s":""}`, years: (n) => `${n} Year${n>1?"s":""}`,
    errPersonal: "Please fill in all required fields (First name, Last name, ID Card, Phone)",
    errIdCard: "National ID must be 13 digits", errCompany: "Please fill in all company fields",
    errTaxId: "Tax ID must be 13 digits", errProduct: "Please fill in all product fields",
    otherBrand: "Other – please specify", specifyBrand: "Enter brand name",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "Product model", receiptPlaceholder: "INV-XXXXXXX",
    branchNoPlaceholder: "e.g. 00001", contactFirstPlaceholder: "First name", contactLastPlaceholder: "Last name",
    companyNamePlaceholder: "Company / Business name", address1Placeholder: "House No., Road, Lane, etc.",
    subdistrictPlaceholder: "Type to search", districtPlaceholder: "Type to search",
    provincePlaceholder: "Type to search", postcodePlaceholder: "XXXXX",
    pmSection: "Preventive Maintenance (PM)", pmRequired: "PM Required", pmNotRequired: "No PM Required",
    pmDate: "Next PM Date", pmNote: "PM Notes", pmAssign: "Assigned Technician",
    pmStatus: "PM Status", pmSaved: "PM saved successfully",
    pmOverdue: "PM Overdue", pmSoon: (d) => `PM in ${d} days`, pmOk: (d) => `PM in ${d} days`, pmNone: "No PM",
    tabInfo: "Info", tabPM: "PM",
    filterAll: "All", filterPMDue: "PM Due", filterNearExp: "Near Expiry", filterExpired: "Expired",
  },
  zh: {
    appTitle: "Royal Group", appSub: "产品质保登记系统",
    navRegister: "登记注册", navCheck: "查询状态", navAdmin: "管理员",
    personal: "个人客户", company: "企业客户",
    sectionPersonal: "个人信息", sectionCompany: "公司信息", sectionProduct: "产品信息",
    firstName: "名字", lastName: "姓氏", idCard: "身份证号码",
    phone: "电话号码", email: "电子邮件",
    address: "地址", address1: "门牌号、街道、巷弄等",
    subdistrict: "区/分区", district: "县/市区", province: "省/府", postcode: "邮政编码",
    companyType: "公司类型", companyName: "公司名称", branchType: "办公室类型",
    hq: "总部", branch: "分公司", branchNo: "分公司编号",
    taxId: "纳税人识别号 (13位)", contactName: "联系人姓名",
    productType: "产品", brand: "品牌", brandOther: "请注明品牌",
    serial: "序列号", model: "型号", purchaseDate: "购买日期",
    warrantyMonths: "保修期限",     receipt: "收据 / 税务发票号码",
    receiptNote: "如通过 Shopee、TikTok、Lazada 等平台网购且没有税务发票号码，请填写订单编号代替。",
    submitBtn: "提交质保登记",
    successMsg: (id) => `✓ 登记成功！编号：${id}`,
    selectProductType: "-- 请选择产品类型 --", selectBrand: "-- 请选择品牌 --",
    selectCompanyType: "-- 请选择公司类型 --",
    checkTitle: "查询质保状态",     checkPlaceholder: "请输入序列号、税务发票号码或订单编号",
    checkBtn: "查询", notFound: "未找到该序列号或税务发票号码的登记记录。",
    registrant: "登记人", regCode: "登记编号", buyDate: "购买日期", expDate: "到期日期",
    adminPin: "管理员密码", pinPlaceholder: "密码（默认：1234）",
    loginBtn: "登录", wrongPin: "密码错误",
    totalReg: "总登记数", nearExpire: "即将到期", expired: "已过期", pmDue: "PM 到期",
    searchPlaceholder: "搜索姓名、序列号、型号、编号...",
    colCode: "编号", colName: "姓名 / 公司", colModel: "型号", colSerial: "序列号", colStatus: "状态",
    noData: "未找到数据", showing: (f,t) => `显示 ${f} / ${t} 条记录`,
    back: "返回", detailProduct: "产品详情", save: "保存", cancel: "取消",
    statusActive: (d) => `有效 – 剩余 ${d} 天`, statusNear: (d) => `即将到期 ${d} 天`, statusExp: "已过期",
    fldCompanyType: "公司类型", fldCompany: "公司名称", fldBranch: "办公室类型",
    fldTax: "纳税人识别号", fldPhone: "电话", fldContact: "联系人",
    fldEmail: "电子邮件", fldAddress: "地址", fldName: "姓名", fldIdCard: "身份证号",
    fldProduct: "产品", fldBrand: "品牌", fldModel: "型号", fldSerial: "序列号",
    fldPurchase: "购买日期", fldWarranty: "保修期限", fldExpire: "到期日期",     fldReceipt: "税务发票号码",
    months: (n) => `${n} 个月`, years: (n) => `${n} 年`,
    errPersonal: "请填写所有必填项（姓名、身份证号、电话）",
    errIdCard: "身份证号必须为13位数字", errCompany: "请填写所有公司必填项",
    errTaxId: "纳税人识别号必须为13位数字", errProduct: "请填写所有产品必填项",
    otherBrand: "其他 – 请注明", specifyBrand: "请填写品牌名称",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "产品型号", receiptPlaceholder: "INV-XXXXXXX",
    branchNoPlaceholder: "例如 00001", contactFirstPlaceholder: "名字", contactLastPlaceholder: "姓氏",
    companyNamePlaceholder: "公司名称", address1Placeholder: "门牌号、街道、巷弄等",
    subdistrictPlaceholder: "输入搜索", districtPlaceholder: "输入搜索",
    provincePlaceholder: "输入搜索", postcodePlaceholder: "XXXXX",
    pmSection: "预防性维护 (PM)", pmRequired: "需要 PM", pmNotRequired: "不需要 PM",
    pmDate: "下次 PM 日期", pmNote: "PM 备注", pmAssign: "负责技术员",
    pmStatus: "PM 状态", pmSaved: "PM 保存成功",
    pmOverdue: "PM 已逾期", pmSoon: (d) => `${d} 天后 PM`, pmOk: (d) => `${d} 天后 PM`, pmNone: "无 PM",
    tabInfo: "信息", tabPM: "PM",
    filterAll: "全部", filterPMDue: "PM 到期", filterNearExp: "即将到期", filterExpired: "已过期",
  }
};

const BRANDS = {
  UPS:["APC","Delta","Energys","Maxx","Zircon","Other"],
  Battery:["Energys","Hipow","Maxx","Maxsol","Zircon","Other"],
  Stabilizer:["Energys","Powcon","Zircon","Other"],
  Generator:["Other"], Accessories:["Other"], Others:["Other"],
};

const COMPANY_TYPES = {
  th:["บริษัทจำกัด","บริษัทจำกัดมหาชน","ห้างหุ้นส่วนจำกัด","ห้างหุ้นส่วนสามัญ","ร้านค้า / บุคคลธรรมดา","มูลนิธิ / สมาคม","หน่วยงานราชการ","รัฐวิสาหกิจ","องค์กรปกครองส่วนท้องถิ่น","อื่นๆ"],
  en:["Limited Company","Public Limited Company","Limited Partnership","General Partnership","Sole Proprietorship","Foundation / Association","Government Agency","State Enterprise","Local Government","Other"],
  zh:["有限责任公司","股份有限公司","有限合伙企业","普通合伙企业","个体工商户","基金会 / 协会","政府机关","国有企业","地方政府","其他"],
};

const PRODUCT_TYPES = {
  th:[["UPS","UPS เครื่องสำรองไฟฟ้า"],["Battery","Battery แบตเตอรี่"],["Stabilizer","Stabilizer เครื่องปรับแรงดันไฟฟ้า"],["Generator","Generator เครื่องกำเนิดไฟฟ้า"],["Accessories","Accessories อุปกรณ์เสริม"],["Others","Others อื่นๆ"]],
  en:[["UPS","UPS Uninterruptible Power Supply"],["Battery","Battery"],["Stabilizer","Stabilizer Voltage Regulator"],["Generator","Generator"],["Accessories","Accessories"],["Others","Others"]],
  zh:[["UPS","UPS 不间断电源"],["Battery","Battery 蓄电池"],["Stabilizer","Stabilizer 稳压器"],["Generator","Generator 发电机"],["Accessories","Accessories 配件"],["Others","Others 其他"]],
};

const WARRANTY_OPTIONS = [
  [1,"months"],[3,"months"],[6,"months"],[12,"years"],[24,"years"],[36,"years"],
  [48,"years"],[60,"years"],[72,"years"],[84,"years"],[96,"years"],[108,"years"],[120,"years"],
];

const emptyAddr = { address1:"", subdistrict:"", district:"", province:"", postcode:"" };
const initialForm = {
  type:"personal",
  firstName:"",lastName:"",idCard:"",phone:"",email:"",addr:{...emptyAddr},
  companyType:"",companyName:"",branchType:"HQ",branchNo:"",taxId:"",
  companyPhone:"",contactFirstName:"",contactLastName:"",companyEmail:"",companyAddr:{...emptyAddr},
  productType:"",brand:"",brandOther:"",serial:"",model:"",purchaseDate:"",warrantyMonths:"12",receipt:""
};

function badge(bg,color){ return {background:bg,color,fontSize:12,padding:"3px 10px",borderRadius:99,fontWeight:500,whiteSpace:"nowrap"}; }

function useThaiAddress(){
  const [db,setDb]=useState([]);
  useEffect(()=>{
    fetch("https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/db.json")
      .then(r=>r.json()).then(setDb).catch(()=>setDb([]));
  },[]);
  return db;
}

const inputStyle={width:"100%",padding:"8px 12px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",fontSize:14,boxSizing:"border-box"};
const labelStyle={fontSize:13,color:"var(--color-text-secondary)",marginBottom:4,display:"block"};

function Inp(p){ return <input style={inputStyle} {...p}/>; }
function Sel({children,...p}){ return <select style={inputStyle} {...p}>{children}</select>; }
function Field({label,required,children}){
  return <div style={{marginBottom:14}}>
    <label style={labelStyle}>{label}{required&&<span style={{color:"var(--color-text-danger)"}}> *</span>}</label>
    {children}
  </div>;
}

function StatusBadge({days,t}){
  if(days<0) return <span style={badge("var(--color-background-danger)","var(--color-text-danger)")}>{t.statusExp}</span>;
  if(days<=30) return <span style={badge("var(--color-background-warning)","var(--color-text-warning)")}>{t.statusNear(days)}</span>;
  return <span style={badge("var(--color-background-success)","var(--color-text-success)")}>{t.statusActive(days)}</span>;
}

function PMBadge({pmRequired,pmDate,t}){
  if(!pmRequired) return <span style={badge("var(--color-background-secondary)","var(--color-text-secondary)")}>{t.pmNone}</span>;
  if(!pmDate) return <span style={badge("var(--color-background-info)","var(--color-text-info)")}>PM</span>;
  const d=pmDaysLeft(pmDate);
  if(d<0) return <span style={badge("var(--color-background-danger)","var(--color-text-danger)")}>{t.pmOverdue}</span>;
  if(d<=30) return <span style={badge("var(--color-background-warning)","var(--color-text-warning)")}>{t.pmSoon(d)}</span>;
  return <span style={badge("var(--color-background-success)","var(--color-text-success)")}>{t.pmOk(d)}</span>;
}

function AddressFields({value,onChange,t}){
  const db=useThaiAddress();
  const [suggestions,setSuggestions]=useState([]);
  const [activeField,setActiveField]=useState(null);
  const wrapRef=useRef(null);
  useEffect(()=>{
    function h(e){ if(wrapRef.current&&!wrapRef.current.contains(e.target)){setSuggestions([]);setActiveField(null);} }
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);
  function search(field,val){
    onChange({...value,[field]:val});
    if(!val||db.length===0){setSuggestions([]);return;}
    const q=val.toLowerCase(); let res=[];
    if(field==="subdistrict") res=db.filter(r=>r.subdistrict?.toLowerCase().startsWith(q)).slice(0,8);
    else if(field==="district") res=db.filter(r=>r.district?.toLowerCase().startsWith(q)&&(!value.subdistrict||r.subdistrict===value.subdistrict)).slice(0,8);
    else if(field==="province") res=db.filter(r=>r.province?.toLowerCase().startsWith(q)).slice(0,8);
    else if(field==="postcode") res=db.filter(r=>String(r.zipcode).startsWith(val)).slice(0,8);
    setSuggestions(res);setActiveField(field);
  }
  function pick(item){
    onChange({...value,subdistrict:item.subdistrict||"",district:item.district||"",province:item.province||"",postcode:String(item.zipcode||"")});
    setSuggestions([]);setActiveField(null);
  }
  const fields=[
    {key:"subdistrict",label:t.subdistrict,placeholder:t.subdistrictPlaceholder},
    {key:"district",label:t.district,placeholder:t.districtPlaceholder},
    {key:"province",label:t.province,placeholder:t.provincePlaceholder},
    {key:"postcode",label:t.postcode,placeholder:t.postcodePlaceholder},
  ];
  return(
    <div ref={wrapRef} style={{gridColumn:"span 2"}}>
      <label style={labelStyle}>{t.address}</label>
      <div style={{marginBottom:8}}><Inp value={value.address1} placeholder={t.address1Placeholder} onChange={e=>onChange({...value,address1:e.target.value})}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 120px",gap:8,marginBottom:14}}>
        {fields.map(f=>(
          <div key={f.key} style={{position:"relative"}}>
            <label style={{...labelStyle,fontSize:11}}>{f.label}</label>
            <input style={inputStyle} value={value[f.key]} placeholder={f.placeholder}
              onChange={e=>search(f.key,e.target.value)} autoComplete="off"
              onFocus={()=>{if(activeField!==f.key)setSuggestions([]);}}/>
            {activeField===f.key&&suggestions.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:999,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,maxHeight:200,overflowY:"auto"}}>
                {suggestions.map((item,i)=>(
                  <div key={i} onMouseDown={()=>pick(item)}
                    style={{padding:"8px 12px",fontSize:13,cursor:"pointer",borderBottom:"0.5px solid var(--color-border-tertiary)",color:"var(--color-text-primary)"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"}
                    onMouseLeave={e=>e.currentTarget.style.background=""}>
                    <span style={{fontWeight:500}}>{item[f.key]||item.subdistrict}</span>
                    <span style={{color:"var(--color-text-secondary)",marginLeft:6,fontSize:11}}>{item.subdistrict} › {item.district} › {item.province} {item.zipcode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

function fmtAddr(a){ if(!a)return"-"; return[a.address1,a.subdistrict,a.district,a.province,a.postcode].filter(Boolean).join(" "); }
function fmtWarranty(months,t){ const m=Number(months); if(m<12)return t.months(m); return t.years(m/12); }

export default function App(){
  const [lang,setLang]=useState("th");
  const t=T[lang];
  const [page,setPage]=useState("register");
  const [form,setForm]=useState(initialForm);
  const [records,setRecords]=useState([]);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [checkSerial,setCheckSerial]=useState("");
  const [checkResult,setCheckResult]=useState(null);
  const [success,setSuccess]=useState(null);
  const [adminPin,setAdminPin]=useState("");
  const [adminAuth,setAdminAuth]=useState(false);
  const [adminError,setAdminError]=useState("");
  const [viewRecord,setViewRecord]=useState(null);
  const [activeTab,setActiveTab]=useState("info");
  const [pmEdit,setPmEdit]=useState(null);
  const [pmSaved,setPmSaved]=useState(false);

  useEffect(()=>{ try{setRecords(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"));}catch{} },[]);
  function save(r){ setRecords(r); localStorage.setItem(STORAGE_KEY,JSON.stringify(r)); }

  function setF(k,v){
    setForm(f=>{
      const u={...f,[k]:v};
      if(k==="productType"){u.brand="";u.brandOther="";}
      if(k==="brand"&&v!=="Other")u.brandOther="";
      return u;
    });
  }
  function setAddr(which,v){ setForm(f=>({...f,[which]:v})); }

  function validate(){
    if(form.type==="personal"){
      if(!form.firstName||!form.lastName||!form.idCard||!form.phone)return t.errPersonal;
      if(!/^\d{13}$/.test(form.idCard))return t.errIdCard;
    } else {
      if(!form.companyName||!form.companyType||!form.taxId||!form.companyPhone)return t.errCompany;
      if(!/^\d{13}$/.test(form.taxId))return t.errTaxId;
    }
    if(!form.productType||!form.brand||(form.brand==="Other"&&!form.brandOther)||!form.serial||!form.model||!form.purchaseDate)return t.errProduct;
    return null;
  }

  function handleSubmit(){
    const err=validate();
    if(err){setSuccess({ok:false,msg:err});return;}
    const id=genId();
    save([{id,...form,pm:{required:false,date:"",note:"",assignee:""},createdAt:new Date().toISOString()},...records]);
    setSuccess({ok:true,id});setForm(initialForm);
    setTimeout(()=>{setSuccess(null);setPage("register");},3500);
  }

  function handleCheck(){
    const r=records.find(x=>x.serial?.toLowerCase()===checkSerial.trim().toLowerCase());
    setCheckResult(r||"notfound");
  }

  function savePM(){
    const updated=records.map(r=>r.id===viewRecord.id?{...r,pm:pmEdit}:r);
    save(updated);
    setViewRecord({...viewRecord,pm:pmEdit});
    setPmSaved(true);
    setTimeout(()=>setPmSaved(false),2500);
  }

  const pmDueRecords=records.filter(r=>{
    if(!r.pm?.required||!r.pm?.date)return false;
    const d=pmDaysLeft(r.pm.date);
    return d<=30;
  });

  let filtered=records.filter(r=>{
    const q=search.toLowerCase();
    return r.serial?.toLowerCase().includes(q)||r.model?.toLowerCase().includes(q)||
      r.firstName?.toLowerCase().includes(q)||r.companyName?.toLowerCase().includes(q)||r.id?.toLowerCase().includes(q);
  });
  if(filter==="pmdue") filtered=filtered.filter(r=>r.pm?.required&&r.pm?.date&&pmDaysLeft(r.pm.date)<=30);
  if(filter==="nearexp") filtered=filtered.filter(r=>{ const d=daysLeft(r.purchaseDate,r.warrantyMonths); return d>=0&&d<=30; });
  if(filter==="expired") filtered=filtered.filter(r=>daysLeft(r.purchaseDate,r.warrantyMonths)<0);

  const expiringSoon=records.filter(r=>{ const d=daysLeft(r.purchaseDate,r.warrantyMonths); return d>=0&&d<=30; });

  function navBtn(label,p,icon){
    const active=page===p;
    return(
      <button onClick={()=>{setPage(p);setSuccess(null);}}
        style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,
          border:active?"1.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",
          background:active?"var(--color-background-info)":"var(--color-background-primary)",
          color:active?"var(--color-text-info)":"var(--color-text-secondary)",
          fontWeight:active?500:400,fontSize:14,cursor:"pointer"}}>
        <i className={`ti ${icon}`} style={{fontSize:18}} aria-hidden="true"/>{label}
      </button>
    );
  }

  const sec={background:"var(--color-background-secondary)",borderRadius:12,padding:"18px 20px",marginBottom:18};
  const secTitle={fontWeight:500,fontSize:15,marginBottom:16,color:"var(--color-text-primary)"};
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"};
  const s2={gridColumn:"span 2"};

  return(
    <div style={{fontFamily:"var(--font-sans)",maxWidth:720,margin:"0 auto",padding:"1.5rem 1rem"}}>
      <h2 style={{display:"none"}}>Warranty Registration</h2>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:10,background:"var(--color-background-info)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <i className="ti ti-shield-check" style={{fontSize:22,color:"var(--color-text-info)"}} aria-hidden="true"/>
          </div>
          <div>
            <div style={{fontWeight:500,fontSize:18,color:"var(--color-text-primary)"}}>{t.appTitle}</div>
            <div style={{fontSize:13,color:"var(--color-text-secondary)"}}>{t.appSub}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[["th","ไทย"],["en","EN"],["zh","中文"]].map(([l,label])=>(
            <button key={l} onClick={()=>setLang(l)}
              style={{padding:"6px 14px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:lang===l?500:400,
                border:lang===l?"1.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",
                background:lang===l?"var(--color-background-info)":"var(--color-background-primary)",
                color:lang===l?"var(--color-text-info)":"var(--color-text-secondary)"}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:28}}>
        {navBtn(t.navRegister,"register","ti-clipboard-plus")}
        {navBtn(t.navCheck,"check","ti-search")}
        {navBtn(t.navAdmin,"admin","ti-layout-dashboard")}
      </div>

      {/* ===== REGISTER ===== */}
      {page==="register"&&(
        <div>
          {success&&(
            <div style={{padding:"14px 18px",borderRadius:10,marginBottom:18,
              background:success.ok?"var(--color-background-success)":"var(--color-background-danger)",
              color:success.ok?"var(--color-text-success)":"var(--color-text-danger)",
              border:`0.5px solid ${success.ok?"var(--color-border-success)":"var(--color-border-danger)"}`}}>
              {success.ok?t.successMsg(success.id):`✗ ${success.msg}`}
            </div>
          )}
          <div style={{display:"flex",gap:10,marginBottom:22}}>
            {["personal","company"].map(tp=>(
              <button key={tp} onClick={()=>setF("type",tp)}
                style={{flex:1,padding:"10px",borderRadius:10,
                  border:form.type===tp?"1.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",
                  background:form.type===tp?"var(--color-background-info)":"var(--color-background-secondary)",
                  color:form.type===tp?"var(--color-text-info)":"var(--color-text-secondary)",
                  cursor:"pointer",fontWeight:form.type===tp?500:400,fontSize:14}}>
                <i className={`ti ${tp==="personal"?"ti-user":"ti-building"}`} style={{marginRight:8}} aria-hidden="true"/>
                {tp==="personal"?t.personal:t.company}
              </button>
            ))}
          </div>

          {form.type==="personal"&&(
            <div style={sec}>
              <div style={secTitle}><i className="ti ti-user" style={{marginRight:8}} aria-hidden="true"/>{t.sectionPersonal}</div>
              <div style={g2}>
                <Field label={t.firstName} required><Inp value={form.firstName} onChange={e=>setF("firstName",e.target.value)} placeholder={t.contactFirstPlaceholder}/></Field>
                <Field label={t.lastName} required><Inp value={form.lastName} onChange={e=>setF("lastName",e.target.value)} placeholder={t.contactLastPlaceholder}/></Field>
                <Field label={t.idCard} required><Inp value={form.idCard} onChange={e=>setF("idCard",e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" maxLength={13}/></Field>
                <Field label={t.phone} required><Inp value={form.phone} onChange={e=>setF("phone",e.target.value)} placeholder="08XXXXXXXX"/></Field>
                <div style={s2}><Field label={t.email}><Inp type="email" value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="email@example.com"/></Field></div>
                <AddressFields value={form.addr} onChange={v=>setAddr("addr",v)} t={t}/>
              </div>
            </div>
          )}

          {form.type==="company"&&(
            <div style={sec}>
              <div style={secTitle}><i className="ti ti-building" style={{marginRight:8}} aria-hidden="true"/>{t.sectionCompany}</div>
              <div style={g2}>
                <div style={s2}><Field label={t.companyType} required>
                  <Sel value={form.companyType} onChange={e=>setF("companyType",e.target.value)}>
                    <option value="">{t.selectCompanyType}</option>
                    {COMPANY_TYPES[lang].map((ct,i)=><option key={i} value={ct}>{ct}</option>)}
                  </Sel>
                </Field></div>
                <div style={s2}><Field label={t.companyName} required><Inp value={form.companyName} onChange={e=>setF("companyName",e.target.value)} placeholder={t.companyNamePlaceholder}/></Field></div>
                <Field label={t.branchType} required>
                  <Sel value={form.branchType} onChange={e=>setF("branchType",e.target.value)}>
                    <option value="HQ">{t.hq}</option>
                    <option value="branch">{t.branch}</option>
                  </Sel>
                </Field>
                {form.branchType==="branch"&&<Field label={t.branchNo}><Inp value={form.branchNo} onChange={e=>setF("branchNo",e.target.value)} placeholder={t.branchNoPlaceholder}/></Field>}
                <Field label={t.taxId} required><Inp value={form.taxId} onChange={e=>setF("taxId",e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" maxLength={13}/></Field>
                <Field label={t.phone} required><Inp value={form.companyPhone} onChange={e=>setF("companyPhone",e.target.value)} placeholder="02XXXXXXX"/></Field>
                <div style={s2}>
                  <label style={labelStyle}>{t.contactName}</label>
                  <div style={{display:"flex",gap:10,marginBottom:14}}>
                    <Inp value={form.contactFirstName} onChange={e=>setF("contactFirstName",e.target.value)} placeholder={t.contactFirstPlaceholder}/>
                    <Inp value={form.contactLastName} onChange={e=>setF("contactLastName",e.target.value)} placeholder={t.contactLastPlaceholder}/>
                  </div>
                </div>
                <div style={s2}><Field label={t.email}><Inp type="email" value={form.companyEmail} onChange={e=>setF("companyEmail",e.target.value)} placeholder="email@company.com"/></Field></div>
                <AddressFields value={form.companyAddr} onChange={v=>setAddr("companyAddr",v)} t={t}/>
              </div>
            </div>
          )}

          <div style={sec}>
            <div style={secTitle}><i className="ti ti-package" style={{marginRight:8}} aria-hidden="true"/>{t.sectionProduct}</div>
            <div style={g2}>
              <div style={s2}><Field label={t.productType} required>
                <Sel value={form.productType} onChange={e=>setF("productType",e.target.value)}>
                  <option value="">{t.selectProductType}</option>
                  {PRODUCT_TYPES[lang].map(([val,label])=><option key={val} value={val}>{label}</option>)}
                </Sel>
              </Field></div>
              {form.productType&&(
                <div style={s2}>
                  <Field label={t.brand} required>
                    <Sel value={form.brand} onChange={e=>setF("brand",e.target.value)}>
                      <option value="">{t.selectBrand}</option>
                      {(BRANDS[form.productType]||[]).map(b=><option key={b} value={b}>{b==="Other"?t.otherBrand:b}</option>)}
                    </Sel>
                  </Field>
                  {form.brand==="Other"&&<Field label={t.brandOther} required><Inp value={form.brandOther} onChange={e=>setF("brandOther",e.target.value)} placeholder={t.specifyBrand}/></Field>}
                </div>
              )}
              <Field label={t.serial} required><Inp value={form.serial} onChange={e=>setF("serial",e.target.value)} placeholder={t.serialPlaceholder}/></Field>
              <Field label={t.model} required><Inp value={form.model} onChange={e=>setF("model",e.target.value)} placeholder={t.modelPlaceholder}/></Field>
              <Field label={t.purchaseDate} required><Inp type="date" value={form.purchaseDate} onChange={e=>setF("purchaseDate",e.target.value)}/></Field>
              <Field label={t.warrantyMonths}>
                <Sel value={form.warrantyMonths} onChange={e=>setF("warrantyMonths",e.target.value)}>
                  {WARRANTY_OPTIONS.map(([n,unit])=>{
                    const val=String(n);
                    const label=unit==="months"?t.months(n):t.years(n/12);
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </Sel>
              </Field>
              <div style={s2}>
                <Field label={t.receipt}>
                  <Inp value={form.receipt} onChange={e=>setF("receipt",e.target.value)} placeholder={t.receiptPlaceholder}/>
                  <div style={{marginTop:6,fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-warning)",borderRadius:6,padding:"7px 10px",border:"0.5px solid var(--color-border-warning)",lineHeight:1.6}}>
                    <i className="ti ti-info-circle" style={{marginRight:6,fontSize:13,verticalAlign:"-2px"}} aria-hidden="true"/>
                    {t.receiptNote}
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <button onClick={handleSubmit}
            style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"var(--color-background-info)",color:"var(--color-text-info)",fontWeight:500,fontSize:15,cursor:"pointer"}}>
            <i className="ti ti-shield-check" style={{marginRight:8}} aria-hidden="true"/>{t.submitBtn}
          </button>
        </div>
      )}

      {/* ===== CHECK ===== */}
      {page==="check"&&(
        <div>
          <div style={sec}>
            <div style={secTitle}><i className="ti ti-search" style={{marginRight:8}} aria-hidden="true"/>{t.checkTitle}</div>
            <div style={{display:"flex",gap:10}}>
              <Inp value={checkSerial} onChange={e=>setCheckSerial(e.target.value)} placeholder={t.checkPlaceholder} onKeyDown={e=>e.key==="Enter"&&handleCheck()}/>
              <button onClick={handleCheck}
                style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-info)",color:"var(--color-text-info)",cursor:"pointer",fontWeight:500,whiteSpace:"nowrap"}}>{t.checkBtn}</button>
            </div>
          </div>
          {checkResult==="notfound"&&(
            <div style={{marginTop:16,padding:"14px 18px",borderRadius:10,background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)"}}>{t.notFound}</div>
          )}
          {checkResult&&checkResult!=="notfound"&&(
            <div style={{marginTop:16,...sec}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <div style={{fontWeight:500,fontSize:16}}>{checkResult.model}</div>
                  <div style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)"}}>S/N: {checkResult.serial}</div>
                </div>
                <StatusBadge days={daysLeft(checkResult.purchaseDate,checkResult.warrantyMonths)} t={t}/>
              </div>

              {/* ข้อมูลสินค้า */}
              <div style={{fontWeight:500,fontSize:14,marginBottom:10,color:"var(--color-text-primary)"}}>
                <i className="ti ti-package" style={{marginRight:6}} aria-hidden="true"/>{t.sectionProduct}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
                {[
                  [t.fldProduct, checkResult.productType||"-"],
                  [t.fldBrand, checkResult.brand==="Other"?(checkResult.brandOther||"Other"):(checkResult.brand||"-")],
                  [t.fldModel, checkResult.model],
                  [t.fldSerial, checkResult.serial],
                  [t.fldPurchase, checkResult.purchaseDate],
                  [t.fldWarranty, fmtWarranty(checkResult.warrantyMonths,t)],
                  [t.fldExpire, (()=>{const d=new Date(checkResult.purchaseDate);d.setMonth(d.getMonth()+Number(checkResult.warrantyMonths));return d.toLocaleDateString("th-TH");})()],
                  [t.fldReceipt, checkResult.receipt||"-"],
                ].map(([k,v])=>(
                  <div key={k} style={{background:"var(--color-background-primary)",borderRadius:8,padding:"10px 14px",border:"0.5px solid var(--color-border-tertiary)"}}>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ข้อมูลผู้ลงทะเบียน */}
              <div style={{fontWeight:500,fontSize:14,marginBottom:10,color:"var(--color-text-primary)"}}>
                <i className={`ti ${checkResult.type==="personal"?"ti-user":"ti-building"}`} style={{marginRight:6}} aria-hidden="true"/>
                {checkResult.type==="personal"?t.sectionPersonal:t.sectionCompany}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {(checkResult.type==="personal"?[
                  [t.fldName, `${checkResult.firstName} ${checkResult.lastName}`],
                  [t.fldPhone, checkResult.phone],
                  [t.fldEmail, checkResult.email||"-"],
                  [t.fldAddress, fmtAddr(checkResult.addr)],
                ]:[
                  [t.fldCompanyType, checkResult.companyType||"-"],
                  [t.fldCompany, checkResult.companyName],
                  [t.fldBranch, checkResult.branchType==="HQ"?t.hq:`${t.branch} ${checkResult.branchNo}`],
                  [t.fldTax, checkResult.taxId||"-"],
                  [t.fldAddress, fmtAddr(checkResult.companyAddr)],
                ]).map(([k,v])=>(
                  <div key={k} style={{background:"var(--color-background-primary)",borderRadius:8,padding:"10px 14px",border:"0.5px solid var(--color-border-tertiary)"}}>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{marginTop:14,fontSize:12,color:"var(--color-text-secondary)",textAlign:"center"}}>
                {t.regCode}: <span style={{fontFamily:"var(--font-mono)"}}>{checkResult.id}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== ADMIN LOGIN ===== */}
      {page==="admin"&&!adminAuth&&(
        <div style={{...sec,maxWidth:340}}>
          <div style={secTitle}><i className="ti ti-lock" style={{marginRight:8}} aria-hidden="true"/>{t.adminPin}</div>
          <Inp type="password" value={adminPin} onChange={e=>setAdminPin(e.target.value)} placeholder={t.pinPlaceholder}
            onKeyDown={e=>{if(e.key==="Enter"){if(adminPin==="1234"){setAdminAuth(true);setAdminError("");}else setAdminError(t.wrongPin);}}}/>
          {adminError&&<div style={{fontSize:13,color:"var(--color-text-danger)",marginTop:8}}>{adminError}</div>}
          <button onClick={()=>{if(adminPin==="1234"){setAdminAuth(true);setAdminError("");}else setAdminError(t.wrongPin);}}
            style={{marginTop:14,width:"100%",padding:"10px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-info)",color:"var(--color-text-info)",cursor:"pointer",fontWeight:500}}>
            {t.loginBtn}
          </button>
        </div>
      )}

      {/* ===== ADMIN DASHBOARD ===== */}
      {page==="admin"&&adminAuth&&!viewRecord&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
            {[
              [t.totalReg,records.length,"ti-clipboard-list","info"],
              [t.nearExpire,expiringSoon.length,"ti-alert-triangle","warning"],
              [t.expired,records.filter(r=>daysLeft(r.purchaseDate,r.warrantyMonths)<0).length,"ti-x","danger"],
              [t.pmDue,pmDueRecords.length,"ti-tool","purple" in {} ? "purple" : "info"],
            ].map(([label,val,icon,c],i)=>(
              <div key={label} style={{background:i===3?"var(--color-background-secondary)":`var(--color-background-${c})`,borderRadius:10,padding:"14px 16px",border:i===3?"0.5px solid var(--color-border-secondary)":`0.5px solid var(--color-border-${c})`}}>
                <div style={{fontSize:12,color:i===3?"var(--color-text-primary)":`var(--color-text-${c})`,marginBottom:4}}>
                  <i className={`ti ${icon}`} style={{marginRight:6}} aria-hidden="true"/>{label}
                </div>
                <div style={{fontSize:24,fontWeight:500,color:i===3?"var(--color-text-primary)":`var(--color-text-${c})`}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {[["all",t.filterAll],["pmdue",t.filterPMDue],["nearexp",t.filterNearExp],["expired",t.filterExpired]].map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)}
                style={{padding:"6px 14px",borderRadius:8,fontSize:13,cursor:"pointer",
                  border:filter===val?"1.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",
                  background:filter===val?"var(--color-background-info)":"var(--color-background-secondary)",
                  color:filter===val?"var(--color-text-info)":"var(--color-text-secondary)",fontWeight:filter===val?500:400}}>
                {label}
              </button>
            ))}
          </div>

          <div style={{marginBottom:16,position:"relative"}}>
            <i className="ti ti-search" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--color-text-secondary)",fontSize:16}} aria-hidden="true"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{...inputStyle,paddingLeft:38}}/>
          </div>

          <div style={{borderRadius:12,border:"0.5px solid var(--color-border-tertiary)",overflow:"hidden"}}>
            {filtered.length===0&&<div style={{padding:"24px",textAlign:"center",color:"var(--color-text-secondary)"}}>{t.noData}</div>}
            {filtered.map((r,i)=>{
              const name=r.type==="personal"?`${r.firstName} ${r.lastName}`:r.companyName;
              return(
                <div key={r.id} style={{borderBottom:"0.5px solid var(--color-border-tertiary)",background:i%2===0?"var(--color-background-primary)":"var(--color-background-secondary)",padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{minWidth:0,flex:1}}>
                      <div style={{fontWeight:500,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",marginTop:2}}>{r.id}</div>
                    </div>
                                          <button onClick={()=>{setViewRecord(r);setPmEdit(r.pm?{...r.pm}:{required:false,date:"",note:"",assignee:""});setActiveTab("info");}}

                      style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-info)",fontSize:18,flexShrink:0,padding:"2px 4px"}} aria-label="view">
                      <i className="ti ti-eye" aria-hidden="true"/>
                    </button>
                  </div>
                  <div style={{marginTop:8,fontSize:13,color:"var(--color-text-secondary)"}}>
                    <span style={{marginRight:12}}><i className="ti ti-package" style={{marginRight:4,fontSize:12}} aria-hidden="true"/>{r.model}</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:12}}>{r.serial}</span>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                    <StatusBadge days={daysLeft(r.purchaseDate,r.warrantyMonths)} t={t}/>
                    <PMBadge pmRequired={r.pm?.required} pmDate={r.pm?.date} t={t}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:10,fontSize:12,color:"var(--color-text-secondary)"}}>{t.showing(filtered.length,records.length)}</div>
        </div>
      )}

      {/* ===== VIEW RECORD ===== */}
      {page==="admin"&&adminAuth&&viewRecord&&(
        <div>
          <button onClick={()=>setViewRecord(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"var(--color-text-secondary)",fontSize:14,marginBottom:16}}>
            <i className="ti ti-arrow-left" aria-hidden="true"/> {t.back}
          </button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{fontWeight:500,fontSize:18}}>{viewRecord.type==="personal"?`${viewRecord.firstName} ${viewRecord.lastName}`:viewRecord.companyName}</div>
              <div style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)"}}>{viewRecord.id}</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <StatusBadge days={daysLeft(viewRecord.purchaseDate,viewRecord.warrantyMonths)} t={t}/>
              <PMBadge pmRequired={viewRecord.pm?.required} pmDate={viewRecord.pm?.date} t={t}/>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            {[["info",`<i class='ti ti-user' style='margin-right:6px'></i>${t.tabInfo}`],["pm",`<i class='ti ti-tool' style='margin-right:6px'></i>${t.tabPM}`]].map(([tab,label])=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                style={{padding:"10px 22px",border:"none",borderBottom:activeTab===tab?"2px solid var(--color-text-info)":"2px solid transparent",
                  background:"none",color:activeTab===tab?"var(--color-text-info)":"var(--color-text-secondary)",
                  cursor:"pointer",fontWeight:activeTab===tab?500:400,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                <i className={`ti ${tab==="info"?"ti-user":"ti-tool"}`} aria-hidden="true"/>{tab==="info"?t.tabInfo:t.tabPM}
              </button>
            ))}
          </div>

          {/* Tab: Info */}
          {activeTab==="info"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {(viewRecord.type==="personal"?[
                  [t.fldName,`${viewRecord.firstName} ${viewRecord.lastName}`],
                  [t.fldIdCard,viewRecord.idCard||"-"],
                  [t.fldPhone,viewRecord.phone],
                  [t.fldEmail,viewRecord.email||"-"],
                  [t.fldAddress,fmtAddr(viewRecord.addr)],
                ]:[
                  [t.fldCompanyType,viewRecord.companyType||"-"],
                  [t.fldCompany,viewRecord.companyName],
                  [t.fldBranch,viewRecord.branchType==="HQ"?t.hq:`${t.branch} ${viewRecord.branchNo}`],
                  [t.fldTax,viewRecord.taxId],
                  [t.fldPhone,viewRecord.companyPhone],
                  [t.fldContact,(viewRecord.contactFirstName||viewRecord.contactLastName)?`${viewRecord.contactFirstName||""} ${viewRecord.contactLastName||""}`.trim():"-"],
                  [t.fldEmail,viewRecord.companyEmail||"-"],
                  [t.fldAddress,fmtAddr(viewRecord.companyAddr)],
                ]).map(([k,v])=>(
                  <div key={k} style={{background:"var(--color-background-secondary)",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{k}</div>
                    <div style={{fontSize:14,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"16px 18px"}}>
                <div style={{fontWeight:500,marginBottom:12}}>{t.detailProduct}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    [t.fldProduct,viewRecord.productType||"-"],
                    [t.fldBrand,viewRecord.brand==="Other"?(viewRecord.brandOther||"Other"):(viewRecord.brand||"-")],
                    [t.fldModel,viewRecord.model],[t.fldSerial,viewRecord.serial],
                    [t.fldPurchase,viewRecord.purchaseDate],[t.fldWarranty,fmtWarranty(viewRecord.warrantyMonths,t)],
                    [t.fldExpire,(()=>{const d=new Date(viewRecord.purchaseDate);d.setMonth(d.getMonth()+Number(viewRecord.warrantyMonths));return d.toLocaleDateString("th-TH");})()],
                    [t.fldReceipt,viewRecord.receipt||"-"],
                  ].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{k}</div>
                      <div style={{fontSize:14,fontWeight:500}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: PM */}
          {activeTab==="pm"&&(
            <div>
              {!pmEdit&&setPmEdit({required:false,date:"",note:"",assignee:""})}
              {pmSaved&&(
                <div style={{padding:"12px 16px",borderRadius:10,marginBottom:16,background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)"}}>
                  ✓ {t.pmSaved}
                </div>
              )}
              <div style={sec}>
                <div style={secTitle}><i className="ti ti-tool" style={{marginRight:8}} aria-hidden="true"/>{t.pmSection}</div>

                {/* PM Required toggle */}
                <div style={{display:"flex",gap:10,marginBottom:20}}>
                  {[[true,t.pmRequired,"ti-check"],[false,t.pmNotRequired,"ti-x"]].map(([val,label,icon])=>(
                    <button key={String(val)} onClick={()=>setPmEdit({...pmEdit,required:val})}
                      style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontSize:14,
                        border:pmEdit.required===val?"1.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",
                        background:pmEdit.required===val?"var(--color-background-info)":"var(--color-background-secondary)",
                        color:pmEdit.required===val?"var(--color-text-info)":"var(--color-text-secondary)",
                        fontWeight:pmEdit.required===val?500:400}}>
                      <i className={`ti ${icon}`} style={{marginRight:8}} aria-hidden="true"/>{label}
                    </button>
                  ))}
                </div>

                {pmEdit.required&&(
                  <div style={g2}>
                    <Field label={t.pmDate}>
                      <Inp type="date" value={pmEdit.date||""} onChange={e=>setPmEdit({...pmEdit,date:e.target.value})}/>
                    </Field>
                    <Field label={t.pmAssign}>
                      <Inp value={pmEdit.assignee||""} onChange={e=>setPmEdit({...pmEdit,assignee:e.target.value})} placeholder="ชื่อผู้รับผิดชอบ"/>
                    </Field>
                    <div style={s2}>
                      <Field label={t.pmNote}>
                        <textarea value={pmEdit.note||""} onChange={e=>setPmEdit({...pmEdit,note:e.target.value})}
                          rows={3} placeholder="รายละเอียดการ PM..."
                          style={{...inputStyle,resize:"vertical"}}/>
                      </Field>
                    </div>
                  </div>
                )}

                <div style={{display:"flex",gap:10,marginTop:4}}>
                  <button onClick={savePM}
                    style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"var(--color-background-info)",color:"var(--color-text-info)",fontWeight:500,fontSize:14,cursor:"pointer"}}>
                    <i className="ti ti-device-floppy" style={{marginRight:8}} aria-hidden="true"/>{t.save}
                  </button>
                  <button onClick={()=>setViewRecord(null)}
                    style={{padding:"10px 20px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",fontSize:14,cursor:"pointer"}}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}