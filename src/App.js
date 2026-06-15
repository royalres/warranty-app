import { useState, useEffect, useRef } from "react";
import { searchAddressByTambon, searchAddressByAmphoe, searchAddressByProvince, searchAddressByZipcode } from "thailand-address-database";
import { supabase } from "./supabaseClient";
import UserManager from "./UserManager";
import { exportToCSV } from "./ExportExcel";
import ImportExcel from "./ImportExcel";
import PrivacyPolicy from "./PrivacyPolicy";

const GOLD = "#c9a84c";
const DARK = "#0a1628";
const DARK2 = "#0d1f3c";
const DARK3 = "#112244";
const BORDER = "#1e3a5f";
const TEXT = "#e8edf5";
const TEXT2 = "#7a9cc0";
const GOLD2 = "#a07830";

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
    navRegister: "ลงทะเบียน", navCheck: "ตรวจสอบ", navAdmin: "แอดมิน", navUsers: "ผู้ใช้งาน",
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
    warrantyMonths: "ระยะเวลารับประกัน", receipt: "เลขที่ใบกำกับภาษี",
    receiptNote: "สำหรับสั่งซื้อ Online เช่น Shopee, TikTok, Lazada ที่ไม่มีเลขที่ใบกำกับภาษี ให้ระบุหมายเลขคำสั่งซื้อแทน",
    submitBtn: "ลงทะเบียนรับประกัน",
    successMsg: (id) => "✓ ลงทะเบียนสำเร็จ! รหัส: " + id,
    selectProductType: "-- เลือกประเภทสินค้า --", selectBrand: "-- เลือกยี่ห้อ --",
    selectCompanyType: "-- เลือกประเภทบริษัท --",
    checkTitle: "ตรวจสอบสถานะการรับประกัน",
    checkPlaceholder: "กรอกเลขซีเรียล หรือ เลขที่ใบกำกับภาษี หรือ หมายเลขคำสั่งซื้อ",
    checkBtn: "ตรวจสอบ", notFound: "ไม่พบข้อมูลการลงทะเบียนสำหรับเลขซีเรียลหรือเลขที่ใบกำกับภาษีนี้",
    registrant: "ผู้ลงทะเบียน", regCode: "รหัสการลงทะเบียน", buyDate: "วันที่ซื้อ", expDate: "หมดประกัน",
    adminPin: "รหัสผ่านแอดมิน", pinPlaceholder: "รหัสผ่าน",
    loginBtn: "เข้าสู่ระบบ", wrongPin: "รหัสผ่านไม่ถูกต้อง",
    totalReg: "ลงทะเบียนทั้งหมด", nearExpire: "ใกล้หมดประกัน", expired: "หมดประกันแล้ว", pmDue: "PM ถึงกำหนด",
    searchPlaceholder: "ค้นหา ชื่อ, ซีเรียล, รุ่น, รหัส...",
    colCode: "รหัส", colName: "ชื่อ / บริษัท", colModel: "รุ่นสินค้า", colSerial: "ซีเรียล", colStatus: "สถานะ",
    noData: "ไม่พบข้อมูล", showing: (f, t) => "แสดง " + f + " จาก " + t + " รายการ",
    back: "กลับ", detailProduct: "ข้อมูลสินค้า", save: "บันทึก", cancel: "ยกเลิก",
    statusActive: (d) => "ใช้งานได้ " + d + " วัน", statusNear: (d) => "ใกล้หมด " + d + " วัน", statusExp: "หมดประกัน",
    fldCompanyType: "ประเภทบริษัท", fldCompany: "บริษัท", fldBranch: "ประเภทสำนักงาน",
    fldTax: "เลขผู้เสียภาษี", fldPhone: "เบอร์โทร", fldContact: "ผู้ติดต่อ",
    fldEmail: "อีเมล", fldAddress: "ที่อยู่", fldName: "ชื่อ-นามสกุล", fldIdCard: "เลขบัตรประชาชน",
    fldProduct: "สินค้า", fldBrand: "ยี่ห้อ", fldModel: "รุ่นสินค้า", fldSerial: "เลขซีเรียล",
    fldPurchase: "วันที่ซื้อ", fldWarranty: "ระยะรับประกัน", fldExpire: "วันหมดประกัน", fldReceipt: "เลขที่ใบกำกับภาษี",
    months: (n) => n + " เดือน", years: (n) => n + " ปี",
    errPersonal: "กรุณากรอกข้อมูลให้ครบ (ชื่อ, นามสกุล, เลขบัตร, เบอร์โทร)",
    errIdCard: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก",
    errCompany: "กรุณากรอกข้อมูลบริษัทให้ครบ", errTaxId: "เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก",
    errProduct: "กรุณากรอกข้อมูลสินค้าให้ครบ",
    otherBrand: "Other อื่นๆโปรดระบุ", specifyBrand: "กรอกยี่ห้อสินค้า",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "รุ่นสินค้า", receiptPlaceholder: "TIV-XXXXX หรือ RT-XXXXX",
    branchNoPlaceholder: "เช่น 00001", contactFirstPlaceholder: "ชื่อ", contactLastPlaceholder: "นามสกุล",
    companyNamePlaceholder: "ชื่อบริษัท / ห้างร้าน", address1Placeholder: "บ้านเลขที่, หมู่, ถนน, ซอย และอื่นๆ",
    subdistrictPlaceholder: "พิมพ์เพื่อค้นหา", districtPlaceholder: "พิมพ์เพื่อค้นหา",
    provincePlaceholder: "พิมพ์เพื่อค้นหา", postcodePlaceholder: "XXXXX",
    pmSection: "การบำรุงรักษา (PM)", pmRequired: "ต้องการ PM", pmNotRequired: "ไม่ต้องการ PM",
    pmDate: "กำหนด PM", pmNote: "หมายเหตุ PM", pmAssign: "ผู้รับผิดชอบ PM",
    pmSaved: "บันทึก PM เรียบร้อย", pmAddSchedule: "เพิ่มกำหนดการ PM",
    pmSchedules: "กำหนดการ PM ทั้งหมด", pmDeleteSchedule: "ลบ",
    pmOverdue: "PM เกินกำหนด", pmSoon: (d) => "PM ใน " + d + " วัน", pmOk: (d) => "PM อีก " + d + " วัน", pmNone: "ไม่มี PM",
    tabInfo: "ข้อมูล", tabPM: "PM",
    filterAll: "ทั้งหมด", filterPMDue: "PM ถึงกำหนด", filterNearExp: "ใกล้หมดประกัน", filterExpired: "หมดประกัน",
    loading: "กำลังโหลด...", saving: "กำลังบันทึก...",
    pdpaText: "ข้าพเจ้ายินยอมให้บริษัท รอยัล เอ็นจิเนียริ่ง เซอร์วิส จำกัด เก็บรวบรวมและใช้ข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อวัตถุประสงค์ในการลงทะเบียนรับประกันสินค้าและการติดต่อที่เกี่ยวข้อง ตาม",
    pdpaLink: "นโยบายความเป็นส่วนตัว",
  },
  en: {
    appTitle: "Royal Group", appSub: "Warranty Registration System",
    navRegister: "Register", navCheck: "Check Status", navAdmin: "Admin", navUsers: "Users",
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
    warrantyMonths: "Warranty Period", receipt: "Receipt / Tax Invoice Number",
    receiptNote: "For online orders (Shopee, TikTok, Lazada) without a tax invoice number, please enter your order number instead.",
    submitBtn: "Register Warranty",
    successMsg: (id) => "✓ Registration successful! Code: " + id,
    selectProductType: "-- Select Product --", selectBrand: "-- Select Brand --",
    selectCompanyType: "-- Select Company Type --",
    checkTitle: "Check Warranty Status",
    checkPlaceholder: "Enter serial number, tax invoice number, or order number",
    checkBtn: "Check", notFound: "No registration found for this serial number or tax invoice number.",
    registrant: "Registrant", regCode: "Registration Code", buyDate: "Purchase Date", expDate: "Expires",
    adminPin: "Admin Password", pinPlaceholder: "Password",
    loginBtn: "Login", wrongPin: "Incorrect password",
    totalReg: "Total Registrations", nearExpire: "Expiring Soon", expired: "Expired", pmDue: "PM Due",
    searchPlaceholder: "Search name, serial, model, code...",
    colCode: "Code", colName: "Name / Company", colModel: "Model", colSerial: "Serial", colStatus: "Status",
    noData: "No data found", showing: (f, t) => "Showing " + f + " of " + t + " records",
    back: "Back", detailProduct: "Product Details", save: "Save", cancel: "Cancel",
    statusActive: (d) => "Active - " + d + " days left", statusNear: (d) => "Expiring in " + d + " days", statusExp: "Expired",
    fldCompanyType: "Company Type", fldCompany: "Company", fldBranch: "Office Type",
    fldTax: "Tax ID", fldPhone: "Phone", fldContact: "Contact Person",
    fldEmail: "Email", fldAddress: "Address", fldName: "Full Name", fldIdCard: "National ID",
    fldProduct: "Product", fldBrand: "Brand", fldModel: "Model", fldSerial: "Serial No.",
    fldPurchase: "Purchase Date", fldWarranty: "Warranty Period", fldExpire: "Expiry Date", fldReceipt: "Receipt / Tax Invoice No.",
    months: (n) => n + (n > 1 ? " Months" : " Month"), years: (n) => n + (n > 1 ? " Years" : " Year"),
    errPersonal: "Please fill in all required fields (First name, Last name, ID Card, Phone)",
    errIdCard: "National ID must be 13 digits", errCompany: "Please fill in all company fields",
    errTaxId: "Tax ID must be 13 digits", errProduct: "Please fill in all product fields",
    otherBrand: "Other - please specify", specifyBrand: "Enter brand name",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "Product model", receiptPlaceholder: "TIV-XXXXX or RT-XXXXX",
    branchNoPlaceholder: "e.g. 00001", contactFirstPlaceholder: "First name", contactLastPlaceholder: "Last name",
    companyNamePlaceholder: "Company / Business name", address1Placeholder: "House No., Road, Lane, etc.",
    subdistrictPlaceholder: "Type to search", districtPlaceholder: "Type to search",
    provincePlaceholder: "Type to search", postcodePlaceholder: "XXXXX",
    pmSection: "Preventive Maintenance (PM)", pmRequired: "PM Required", pmNotRequired: "No PM Required",
    pmDate: "PM Date", pmNote: "PM Notes", pmAssign: "Assigned Technician",
    pmSaved: "PM saved successfully", pmAddSchedule: "Add PM Schedule",
    pmSchedules: "PM Schedules", pmDeleteSchedule: "Delete",
    pmOverdue: "PM Overdue", pmSoon: (d) => "PM in " + d + " days", pmOk: (d) => "PM in " + d + " days", pmNone: "No PM",
    tabInfo: "Info", tabPM: "PM",
    filterAll: "All", filterPMDue: "PM Due", filterNearExp: "Near Expiry", filterExpired: "Expired",
    loading: "Loading...", saving: "Saving...",
    pdpaText: "I consent to Royal Engineering Service Co., Ltd. collecting and using my personal data for the purpose of product warranty registration and related communications, in accordance with the",
    pdpaLink: "Privacy Policy",
  },
  zh: {
    appTitle: "Royal Group", appSub: "产品质保登记系统",
    navRegister: "登记注册", navCheck: "查询状态", navAdmin: "管理员", navUsers: "用户管理",
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
    warrantyMonths: "保修期限", receipt: "收据 / 税务发票号码",
    receiptNote: "如通过 Shopee、TikTok、Lazada 等平台网购且没有税务发票号码，请填写订单编号代替。",
    submitBtn: "提交质保登记",
    successMsg: (id) => "✓ 登记成功！编号：" + id,
    selectProductType: "-- 请选择产品类型 --", selectBrand: "-- 请选择品牌 --",
    selectCompanyType: "-- 请选择公司类型 --",
    checkTitle: "查询质保状态",
    checkPlaceholder: "请输入序列号、税务发票号码或订单编号",
    checkBtn: "查询", notFound: "未找到该序列号或税务发票号码的登记记录。",
    registrant: "登记人", regCode: "登记编号", buyDate: "购买日期", expDate: "到期日期",
    adminPin: "管理员密码", pinPlaceholder: "密码",
    loginBtn: "登录", wrongPin: "密码错误",
    totalReg: "总登记数", nearExpire: "即将到期", expired: "已过期", pmDue: "PM 到期",
    searchPlaceholder: "搜索姓名、序列号、型号、编号...",
    colCode: "编号", colName: "姓名 / 公司", colModel: "型号", colSerial: "序列号", colStatus: "状态",
    noData: "未找到数据", showing: (f, tt) => "显示 " + f + " / " + tt + " 条记录",
    back: "返回", detailProduct: "产品详情", save: "保存", cancel: "取消",
    statusActive: (d) => "有效 - 剩余 " + d + " 天", statusNear: (d) => "即将到期 " + d + " 天", statusExp: "已过期",
    fldCompanyType: "公司类型", fldCompany: "公司名称", fldBranch: "办公室类型",
    fldTax: "纳税人识别号", fldPhone: "电话", fldContact: "联系人",
    fldEmail: "电子邮件", fldAddress: "地址", fldName: "姓名", fldIdCard: "身份证号",
    fldProduct: "产品", fldBrand: "品牌", fldModel: "型号", fldSerial: "序列号",
    fldPurchase: "购买日期", fldWarranty: "保修期限", fldExpire: "到期日期", fldReceipt: "税务发票号码",
    months: (n) => n + " 个月", years: (n) => n + " 年",
    errPersonal: "请填写所有必填项（姓名、身份证号、电话）",
    errIdCard: "身份证号必须为13位数字", errCompany: "请填写所有公司必填项",
    errTaxId: "纳税人识别号必须为13位数字", errProduct: "请填写所有产品必填项",
    otherBrand: "其他 - 请注明", specifyBrand: "请填写品牌名称",
    serialPlaceholder: "SN-XXXXXXXXX", modelPlaceholder: "产品型号", receiptPlaceholder: "TIV-XXXXX 或 RT-XXXXX",
    branchNoPlaceholder: "例如 00001", contactFirstPlaceholder: "名字", contactLastPlaceholder: "姓氏",
    companyNamePlaceholder: "公司名称", address1Placeholder: "门牌号、街道、巷弄等",
    subdistrictPlaceholder: "输入搜索", districtPlaceholder: "输入搜索",
    provincePlaceholder: "输入搜索", postcodePlaceholder: "XXXXX",
    pmSection: "预防性维护 (PM)", pmRequired: "需要 PM", pmNotRequired: "不需要 PM",
    pmDate: "PM 日期", pmNote: "PM 备注", pmAssign: "负责技术员",
    pmSaved: "PM 保存成功", pmAddSchedule: "添加 PM 计划",
    pmSchedules: "PM 计划列表", pmDeleteSchedule: "删除",
    pmOverdue: "PM 已逾期", pmSoon: (d) => d + " 天后 PM", pmOk: (d) => d + " 天后 PM", pmNone: "无 PM",
    tabInfo: "信息", tabPM: "PM",
    filterAll: "全部", filterPMDue: "PM 到期", filterNearExp: "即将到期", filterExpired: "已过期",
    loading: "加载中...", saving: "保存中...",
    pdpaText: "本人同意皇家工程服务有限公司收集和使用本人的个人数据，用于产品质保登记及相关通讯目的，依据",
    pdpaLink: "隐私政策",
  }
};

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "RoyalRes2025";

const BRANDS = {
  UPS: ["APC","Delta","Energys","Maxx","Zircon","Other"],
  Battery: ["Energys","Hipow","Maxx","Maxsol","Zircon","Other"],
  Stabilizer: ["Energys","Powcon","Zircon","Other"],
  Generator: ["Other"], Accessories: ["Other"], Others: ["Other"],
};

const COMPANY_TYPES = {
  th: ["บริษัทจำกัด","บริษัทจำกัดมหาชน","ห้างหุ้นส่วนจำกัด","ห้างหุ้นส่วนสามัญ","ร้านค้า / บุคคลธรรมดา","มูลนิธิ / สมาคม","หน่วยงานราชการ","รัฐวิสาหกิจ","องค์กรปกครองส่วนท้องถิ่น","อื่นๆ"],
  en: ["Limited Company","Public Limited Company","Limited Partnership","General Partnership","Sole Proprietorship","Foundation / Association","Government Agency","State Enterprise","Local Government","Other"],
  zh: ["有限责任公司","股份有限公司","有限合伙企业","普通合伙企业","个体工商户","基金会 / 协会","政府机关","国有企业","地方政府","其他"],
};

const PRODUCT_TYPES = {
  th: [["UPS","UPS เครื่องสำรองไฟฟ้า"],["Battery","Battery แบตเตอรี่"],["Stabilizer","Stabilizer เครื่องปรับแรงดันไฟฟ้า"],["Generator","Generator เครื่องกำเนิดไฟฟ้า"],["Accessories","Accessories อุปกรณ์เสริม"],["Others","Others อื่นๆ"]],
  en: [["UPS","UPS Uninterruptible Power Supply"],["Battery","Battery"],["Stabilizer","Stabilizer Voltage Regulator"],["Generator","Generator"],["Accessories","Accessories"],["Others","Others"]],
  zh: [["UPS","UPS 不间断电源"],["Battery","Battery 蓄电池"],["Stabilizer","Stabilizer 稳压器"],["Generator","Generator 发电机"],["Accessories","Accessories 配件"],["Others","Others 其他"]],
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
  productType: "", brand: "", brandOther: "", installationSite: "", serial:"",model:"",purchaseDate:"",warrantyMonths:"12",receipt:""
};

function toDb(form, id) {
  return {
    id, type: form.type,
    first_name: form.firstName, last_name: form.lastName, id_card: form.idCard,
    phone: form.phone, email: form.email, addr: form.addr,
    company_type: form.companyType, company_name: form.companyName,
    branch_type: form.branchType, branch_no: form.branchNo, tax_id: form.taxId,
    company_phone: form.companyPhone, contact_first_name: form.contactFirstName,
    contact_last_name: form.contactLastName, company_email: form.companyEmail,
    company_addr: form.companyAddr,
    product_type: form.productType, brand: form.brand, brand_other: form.brandOther,
    serial: form.serial, model: form.model, purchase_date: form.purchaseDate,
    warranty_months: Number(form.warrantyMonths), receipt: form.receipt,
    installation_site: form.installationSite || "",
    pm: { required: false, schedules: [] }
  };
}

function fromDb(r) {
  const pm = r.pm || {};
  let schedules = pm.schedules || [];
  if (schedules.length === 0 && pm.date) {
    schedules = [{ date: pm.date, note: pm.note || "", assignee: pm.assignee || "" }];
  }
  return {
    id: r.id, type: r.type,
    firstName: r.first_name, lastName: r.last_name, idCard: r.id_card,
    phone: r.phone, email: r.email, addr: r.addr || emptyAddr,
    companyType: r.company_type, companyName: r.company_name,
    branchType: r.branch_type, branchNo: r.branch_no, taxId: r.tax_id,
    companyPhone: r.company_phone, contactFirstName: r.contact_first_name,
    contactLastName: r.contact_last_name, companyEmail: r.company_email,
    companyAddr: r.company_addr || emptyAddr,
    productType: r.product_type, brand: r.brand, brandOther: r.brand_other,
    serial: r.serial, model: r.model, purchaseDate: r.purchase_date,
    warrantyMonths: String(r.warranty_months), receipt: r.receipt,
    installationSite: r.installation_site || "",
    pm: { required: pm.required || false, schedules },
    createdAt: r.created_at
  };
}

function badge(bg, color) {
  return { background: bg, color, fontSize: 12, padding: "3px 10px", borderRadius: 99, fontWeight: 500, whiteSpace: "nowrap" };
}

function StatusBadge({ days, t }) {
  if (days < 0) return <span style={badge("#fee2e2","#b91c1c")}>{t.statusExp}</span>;
  if (days <= 30) return <span style={badge("#fef9c3","#92400e")}>{t.statusNear(days)}</span>;
  return <span style={badge("#dcfce7","#15803d")}>{t.statusActive(days)}</span>;
}

function PMBadge({ pmRequired, pmDate, t }) {
  if (!pmRequired) return <span style={badge("#f1f5f9","#64748b")}>{t.pmNone}</span>;
  if (!pmDate) return <span style={badge("#dbeafe","#1d4ed8")}>PM</span>;
  const d = pmDaysLeft(pmDate);
  if (d < 0) return <span style={badge("#fee2e2","#b91c1c")}>{t.pmOverdue}</span>;
  if (d <= 30) return <span style={badge("#fef9c3","#92400e")}>{t.pmSoon(d)}</span>;
  return <span style={badge("#dcfce7","#15803d")}>{t.pmOk(d)}</span>;
}


function AddressFields({ value, onChange, t }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function h(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setSuggestions([]); setActiveField(null); } }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function search(field, val) {
    onChange({ ...value, [field]: val });
    if (!val || val.length < 2) { setSuggestions([]); return; }
    let res = [];
    if (field === "subdistrict") res = searchAddressByTambon(val).slice(0, 8);
    else if (field === "district") res = searchAddressByAmphoe(val).slice(0, 8);
    else if (field === "province") res = searchAddressByProvince(val).slice(0, 8);
    else if (field === "postcode") res = searchAddressByZipcode(val).slice(0, 8);
    const mapped = res.map(r => ({
      subdistrict: r.tambon || r.subdistrict || "",
      district: r.amphoe || r.district || "",
      province: r.province || "",
      zipcode: r.zipcode || r.postcode || ""
    }));
    setSuggestions(mapped); setActiveField(field);
  }

  function pick(item) {
    onChange({ ...value, subdistrict: item.subdistrict, district: item.district, province: item.province, postcode: String(item.zipcode) });
    setSuggestions([]); setActiveField(null);
  }

  const fields = [
    { key: "subdistrict", label: t.subdistrict, placeholder: t.subdistrictPlaceholder },
    { key: "district", label: t.district, placeholder: t.districtPlaceholder },
    { key: "province", label: t.province, placeholder: t.provincePlaceholder },
    { key: "postcode", label: t.postcode, placeholder: t.postcodePlaceholder },
  ];

  return (
    <div ref={wrapRef} style={{ gridColumn: "span 2" }}>
      <label style={lbl}>{t.address}</label>
      <div style={{ marginBottom: 8 }}>
        <input style={inp} value={value.address1} placeholder={t.address1Placeholder} onChange={e => onChange({ ...value, address1: e.target.value })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px", gap: 8, marginBottom: 14 }}>
        {fields.map(f => (
          <div key={f.key} style={{ position: "relative" }}>
            <label style={{ ...lbl, fontSize: 11 }}>{f.label}</label>
            <input style={inp} value={value[f.key]} placeholder={f.placeholder}
              onChange={e => search(f.key, e.target.value)} autoComplete="off" />
            {activeField === f.key && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: "#fff", border: "0.5px solid #ccc", borderRadius: 8, maxHeight: 200, overflowY: "auto" }}>
                {suggestions.map((item, i) => (
                  <div key={i} onMouseDown={() => pick(item)}
                    style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "0.5px solid #eee" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <span style={{ fontWeight: 500 }}>{item[f.key]}</span>
                    <span style={{ color: "#888", marginLeft: 6, fontSize: 11 }}>{item.district} - {item.province} {item.zipcode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function fmtAddr(a) {
  if (!a) return "-";
  return [a.address1, a.subdistrict, a.district, a.province, a.postcode].filter(Boolean).join(" ");
}

function fmtWarranty(months, t) {
  const m = Number(months);
  if (m < 12) return t.months(m);
  return t.years(m / 12);
}

function nearestPmDate(pm) {
  if (!pm || !pm.schedules || pm.schedules.length === 0) return null;
  const dates = pm.schedules.map(s => s.date).filter(Boolean).sort();
  return dates[0] || null;
}

const inp = { width: "100%", padding: "10px 14px", borderRadius: 6, border: "1px solid " + BORDER, background: DARK3, color: TEXT, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'Inter', sans-serif" };
const lbl = { fontSize: 12, color: TEXT2, marginBottom: 6, display: "block", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 };
const sec = { background: DARK2, borderRadius: 8, padding: "20px 22px", marginBottom: 16, border: "1px solid " + BORDER };
const secT = { fontWeight: 600, fontSize: 14, marginBottom: 18, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 };
const g2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" };
const s2 = { gridColumn: "span 2" };

function Inp(p) { return <input style={inp} {...p} />; }
function Sel({ children, ...p }) { return <select style={inp} {...p}>{children}</select>; }
function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}{required && <span style={{ color: "#e53e3e" }}> *</span>}</label>
      {children}
    </div>
  );
}

export default function App({ user, profile, onLogout }) {
  const [lang, setLang] = useState("th");
  const t = T[lang];
  const [page, setPage] = useState("register");
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [checkSerial, setCheckSerial] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminPin, setAdminPin] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [viewRecord, setViewRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [pmEdit, setPmEdit] = useState(null);
  const [pmSaved, setPmSaved] = useState(false);
  const [editSite, setEditSite] = useState(false);
  const [siteValue, setSiteValue] = useState("");
  const [pdpaConsent, setPdpaConsent] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);

  async function loadRecords() {
    setLoading(true);
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (!error && data) setRecords(data.map(fromDb));
    setLoading(false);
  }

  useEffect(() => { if (adminAuth) loadRecords(); }, [adminAuth]);

  function setF(k, v) {
    setForm(f => {
      const u = { ...f, [k]: v };
      if (k === "productType") { u.brand = ""; u.brandOther = ""; }
      if (k === "brand" && v !== "Other") u.brandOther = "";
      return u;
    });
  }
  function setAddr(which, v) { setForm(f => ({ ...f, [which]: v })); }

  function validate() {
    if (form.type === "personal") {
      if (!form.firstName || !form.lastName || !form.idCard || !form.phone) return t.errPersonal;
      if (!/^\d{13}$/.test(form.idCard)) return t.errIdCard;
    } else {
      if (!form.companyName || !form.companyType || !form.taxId || !form.companyPhone) return t.errCompany;
      if (!/^\d{13}$/.test(form.taxId)) return t.errTaxId;
    }
    if (!form.productType || !form.brand || (form.brand === "Other" && !form.brandOther) || !form.serial || !form.model || !form.purchaseDate) return t.errProduct;
    if (!pdpaConsent) return "กรุณายินยอมนโยบายความเป็นส่วนตัวก่อนลงทะเบียน";
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setSuccess({ ok: false, msg: err }); return; }
    setSubmitting(true);
    const id = genId();
    const rec = toDb(form, id);
rec.pdpa_consent = true;
rec.pdpa_consent_at = new Date().toISOString();
const { error } = await supabase.from("registrations").insert([rec]);
    if (error) { setSuccess({ ok: false, msg: error.message }); setSubmitting(false); return; }
    setSuccess({ ok: true, id });
    setForm(initialForm);
    setSubmitting(false);
    setTimeout(() => setSuccess(null), 4000);
  }

  async function handleCheck() {
    const q = checkSerial.trim();
    if (!q) return;
    const { data: d1 } = await supabase.from("registrations").select("*").ilike("serial", q);
    if (d1 && d1.length > 0) { setCheckResult(fromDb(d1[0])); return; }
    const { data: d2 } = await supabase.from("registrations").select("*").ilike("receipt", q);
    if (d2 && d2.length > 0) { setCheckResult(fromDb(d2[0])); return; }
    setCheckResult("notfound");
  }

  async function savePM() {
    const { error } = await supabase.from("registrations").update({ pm: pmEdit }).eq("id", viewRecord.id);
    if (error) return;
    const updated = { ...viewRecord, pm: pmEdit };
    setViewRecord(updated);
    setRecords(rs => rs.map(r => r.id === viewRecord.id ? updated : r));
    setPmSaved(true);
    setTimeout(() => setPmSaved(false), 2500);
  }

  const pmDueRecords = records.filter(r => r.pm && r.pm.required && r.pm.schedules && r.pm.schedules.some(s => s.date && pmDaysLeft(s.date) <= 30));
  const expiringSoon = records.filter(r => { const d = daysLeft(r.purchaseDate, r.warrantyMonths); return d >= 0 && d <= 30; });

  let filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (r.serial && r.serial.toLowerCase().includes(q)) || (r.model && r.model.toLowerCase().includes(q)) ||
      (r.firstName && r.firstName.toLowerCase().includes(q)) || (r.companyName && r.companyName.toLowerCase().includes(q)) || (r.id && r.id.toLowerCase().includes(q));
  });
  if (filter === "pmdue") filtered = filtered.filter(r => r.pm && r.pm.required && r.pm.schedules && r.pm.schedules.some(s => s.date && pmDaysLeft(s.date) <= 30));
  if (filter === "nearexp") filtered = filtered.filter(r => { const d = daysLeft(r.purchaseDate, r.warrantyMonths); return d >= 0 && d <= 30; });
  if (filter === "expired") filtered = filtered.filter(r => daysLeft(r.purchaseDate, r.warrantyMonths) < 0);

  
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "0 auto", color: "#1e293b" }}>

     {/* Header */}
      <div style={{ background: DARK, padding: "12px 24px", borderBottom: "1px solid " + BORDER, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
  <img src="/res-logo.png" alt="Royal Group" style={{ height: 44, objectFit: "contain", flexShrink: 0 }} />
  <div style={{ borderLeft: "1px solid " + BORDER, paddingLeft: 14 }}>
    <div style={{ fontWeight: 700, fontSize: 16, color: GOLD, letterSpacing: 1 }}>Royal Group</div>
    <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{t.appSub}</div>
  </div>
</div>

          {/* User Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: TEXT2, display: "none" }}>{user?.email}</span>
            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: profile?.role === "admin" ? "#2d1a00" : profile?.role === "staff" ? "#0d1f2d" : "#1a1a1a",
              color: profile?.role === "admin" ? GOLD : profile?.role === "staff" ? "#60a5fa" : TEXT2,
              border: "1px solid " + BORDER, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>
              {profile?.role || "customer"}
            </span>
            <button onClick={onLogout}
              style={{ background: "none", border: "1px solid " + BORDER, color: TEXT2, fontSize: 11, padding: "5px 10px", borderRadius: 4, cursor: "pointer", letterSpacing: "0.06em" }}>
              LOGOUT
            </button>
          </div>

          {/* Language */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: TEXT2, letterSpacing: "0.05em" }}>🌐 Language</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[["th","ไทย"],["en","EN"],["zh","中文"]].map(([l, label]) => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: "4px 10px", borderRadius: 4, fontSize: 12, cursor: "pointer",
                    fontWeight: lang === l ? 700 : 400,
                    border: lang === l ? "1px solid " + GOLD : "1px solid " + BORDER,
                    background: lang === l ? GOLD : "transparent",
                    color: lang === l ? DARK : TEXT2 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Nav */}
<div style={{ display: "flex", gap: 2, marginBottom: 28, background: DARK2, borderRadius: 8, padding: 4, border: "1px solid " + BORDER }}>
  {[
    ["register", t.navRegister, ["admin","staff","customer"]],
["check", t.navCheck, ["admin","staff","customer"]],
["admin", t.navAdmin, ["admin","staff"]],
["users", t.navUsers, ["admin"]],
  ].filter(([,, roles]) => roles.includes(profile?.role || "customer")).map(([p, label]) => (
    <button key={p} onClick={() => { setPage(p); setSuccess(null); }}
      style={{ flex: 1, padding: "10px", borderRadius: 6, border: "none", background: page === p ? GOLD : "transparent", color: page === p ? DARK : TEXT2, fontWeight: page === p ? 700 : 400, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.2s" }}>
      {label}
    </button>
  ))}
</div>

        {/* ===== REGISTER ===== */}
        {page === "register" && (
          <div>
            {success && (
              <div style={{ padding: "14px 18px", borderRadius: 6, marginBottom: 16, background: success.ok ? "#0d2818" : "#2d0e0e", color: success.ok ? "#4ade80" : "#f87171", border: "1px solid " + (success.ok ? "#166534" : "#7f1d1d"), fontSize: 14 }}>
                {success.ok ? t.successMsg(success.id) : "✗ " + success.msg}
              </div>
            )}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: DARK2, borderRadius: 6, padding: 4, border: "1px solid " + BORDER }}>
              {["personal","company"].map(tp => (
                <button key={tp} onClick={() => setF("type", tp)}
                  style={{ flex: 1, padding: "10px", borderRadius: 4, border: "none", background: form.type === tp ? GOLD : "transparent", color: form.type === tp ? DARK : TEXT2, cursor: "pointer", fontWeight: form.type === tp ? 700 : 400, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s" }}>
                  {tp === "personal" ? t.personal : t.company}
                </button>
              ))}
            </div>

            {form.type === "personal" && (
              <div style={sec}>
                <div style={secT}><span style={{ color: GOLD }}>◆</span> {t.sectionPersonal}</div>
                <div style={g2}>
                  <Field label={t.firstName} required><Inp value={form.firstName} onChange={e => setF("firstName", e.target.value)} placeholder={t.contactFirstPlaceholder} /></Field>
                  <Field label={t.lastName} required><Inp value={form.lastName} onChange={e => setF("lastName", e.target.value)} placeholder={t.contactLastPlaceholder} /></Field>
                  <Field label={t.idCard} required><Inp value={form.idCard} onChange={e => setF("idCard", e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" maxLength={13} /></Field>
                  <Field label={t.phone} required><Inp value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="08XXXXXXXX" /></Field>
                  <div style={s2}><Field label={t.email}><Inp type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="email@example.com" /></Field></div>
                  <AddressFields value={form.addr} onChange={v => setAddr("addr", v)} t={t} />
                </div>
              </div>
            )}

            {form.type === "company" && (
              <div style={sec}>
                <div style={secT}><span style={{ color: GOLD }}>◆</span> {t.sectionCompany}</div>
                <div style={g2}>
                  <div style={s2}><Field label={t.companyType} required>
                    <Sel value={form.companyType} onChange={e => setF("companyType", e.target.value)}>
                      <option value="">{t.selectCompanyType}</option>
                      {COMPANY_TYPES[lang].map((ct, i) => <option key={i} value={ct}>{ct}</option>)}
                    </Sel>
                  </Field></div>
                  <div style={s2}><Field label={t.companyName} required><Inp value={form.companyName} onChange={e => setF("companyName", e.target.value)} placeholder={t.companyNamePlaceholder} /></Field></div>
                  <Field label={t.branchType} required>
                    <Sel value={form.branchType} onChange={e => setF("branchType", e.target.value)}>
                      <option value="HQ">{t.hq}</option>
                      <option value="branch">{t.branch}</option>
                    </Sel>
                  </Field>
                  {form.branchType === "branch" && <Field label={t.branchNo}><Inp value={form.branchNo} onChange={e => setF("branchNo", e.target.value)} placeholder={t.branchNoPlaceholder} /></Field>}
                  <Field label={t.taxId} required><Inp value={form.taxId} onChange={e => setF("taxId", e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" maxLength={13} /></Field>
                  <Field label={t.phone} required><Inp value={form.companyPhone} onChange={e => setF("companyPhone", e.target.value)} placeholder="02XXXXXXX" /></Field>
                  <div style={s2}>
                    <label style={lbl}>{t.contactName}</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                      <Inp value={form.contactFirstName} onChange={e => setF("contactFirstName", e.target.value)} placeholder={t.contactFirstPlaceholder} />
                      <Inp value={form.contactLastName} onChange={e => setF("contactLastName", e.target.value)} placeholder={t.contactLastPlaceholder} />
                    </div>
                  </div>
                  <div style={s2}><Field label={t.email}><Inp type="email" value={form.companyEmail} onChange={e => setF("companyEmail", e.target.value)} placeholder="email@company.com" /></Field></div>
                  <AddressFields value={form.companyAddr} onChange={v => setAddr("companyAddr", v)} t={t} />
                </div>
              </div>
            )}

            <div style={sec}>
              <div style={secT}><span style={{ color: GOLD }}>◆</span> {t.sectionProduct}</div>
              <div style={g2}>
                <div style={s2}><Field label={t.productType} required>
                  <Sel value={form.productType} onChange={e => setF("productType", e.target.value)}>
                    <option value="">{t.selectProductType}</option>
                    {PRODUCT_TYPES[lang].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </Sel>
                </Field></div>
                {form.productType && (
                  <div style={s2}>
                    <Field label={t.brand} required>
                      <Sel value={form.brand} onChange={e => setF("brand", e.target.value)}>
                        <option value="">{t.selectBrand}</option>
                        {(BRANDS[form.productType] || []).map(b => <option key={b} value={b}>{b === "Other" ? t.otherBrand : b}</option>)}
                      </Sel>
                    </Field>
                    {form.brand === "Other" && <Field label={t.brandOther} required><Inp value={form.brandOther} onChange={e => setF("brandOther", e.target.value)} placeholder={t.specifyBrand} /></Field>}
                  </div>
                )}
                <Field label={t.serial} required><Inp value={form.serial} onChange={e => setF("serial", e.target.value)} placeholder={t.serialPlaceholder} /></Field>
                <Field label={t.model} required><Inp value={form.model} onChange={e => setF("model", e.target.value)} placeholder={t.modelPlaceholder} /></Field>
                <Field label={t.purchaseDate} required><Inp type="date" value={form.purchaseDate} onChange={e => setF("purchaseDate", e.target.value)} /></Field>
                <Field label={t.warrantyMonths}>
                  <Sel value={form.warrantyMonths} onChange={e => setF("warrantyMonths", e.target.value)}>
                    {WARRANTY_OPTIONS.map(([n, unit]) => <option key={n} value={String(n)}>{unit === "months" ? t.months(n) : t.years(n / 12)}</option>)}
                  </Sel>
                </Field>
                <div style={s2}>
                  <Field label={t.receipt}>
                    <Inp value={form.receipt} onChange={e => setF("receipt", e.target.value)} placeholder={t.receiptPlaceholder} />
                    <div style={{ marginTop: 6, fontSize: 12, color: "#92400e", background: "#fef9c3", borderRadius: 6, padding: "7px 10px", border: "1px solid #fde68a", lineHeight: 1.6 }}>
                      ℹ️ {t.receiptNote}
                    </div>
                  </Field>
                </div>
              </div>
            </div>

{/* PDPA Consent */}
            <div style={{ background: DARK2, borderRadius: 8, padding: "16px 18px", marginBottom: 16, border: "1px solid " + BORDER }}>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" checked={pdpaConsent} onChange={e => setPdpaConsent(e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: GOLD }} />
                <span style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
                  {t.pdpaText}{" "}
                  <span onClick={() => setShowPrivacy(true)}
                    style={{ color: GOLD, textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                    {t.pdpaLink}
                  </span>
                </span>
              </label>
            </div>

            {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} lang={lang} />}
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: "100%", padding: "14px", borderRadius: 6, background: submitting ? DARK3 : GOLD, color: submitting ? TEXT2 : DARK, fontWeight: 700, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer", border: "none", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s" }}>
              {submitting ? t.saving : "— " + t.submitBtn + " —"}
            </button>
          </div>
        )}

        {/* ===== CHECK ===== */}
        {page === "check" && (
          <div>
            <div style={sec}>
              <div style={secT}><span style={{ color: GOLD }}>◆</span> {t.checkTitle}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Inp value={checkSerial} onChange={e => setCheckSerial(e.target.value)} placeholder={t.checkPlaceholder} onKeyDown={e => e.key === "Enter" && handleCheck()} />
                <button onClick={handleCheck} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: GOLD, color: DARK, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t.checkBtn}</button>
              </div>
            </div>
            {checkResult === "notfound" && (
              <div style={{ padding: "14px 18px", borderRadius: 6, background: "#2d0e0e", color: "#f87171", border: "1px solid #7f1d1d", fontSize: 14 }}>{t.notFound}</div>
            )}
            {checkResult && checkResult !== "notfound" && (
              <div style={sec}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>{checkResult.model}</div>
                    <div style={{ fontSize: 12, color: TEXT2, marginTop: 4, letterSpacing: "0.05em" }}>S/N: {checkResult.serial}</div>
                  </div>
                  <StatusBadge days={daysLeft(checkResult.purchaseDate, checkResult.warrantyMonths)} t={t} />
                </div>
                <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>◆ {t.sectionProduct}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {[
                    [t.fldProduct, checkResult.productType || "-"],
                    [t.fldBrand, checkResult.brand === "Other" ? (checkResult.brandOther || "Other") : (checkResult.brand || "-")],
                    [t.fldModel, checkResult.model],
                    [t.fldSerial, checkResult.serial],
                    [t.fldPurchase, checkResult.purchaseDate],
                    [t.fldWarranty, fmtWarranty(checkResult.warrantyMonths, t)],
                    [t.fldExpire, (() => { const d = new Date(checkResult.purchaseDate); d.setMonth(d.getMonth() + Number(checkResult.warrantyMonths)); return d.toLocaleDateString("th-TH"); })()],
                    [t.fldReceipt, checkResult.receipt || "-"],
                    ["สถานที่ติดตั้ง", checkResult.installationSite || "-"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: DARK3, borderRadius: 6, padding: "10px 14px", border: "1px solid " + BORDER }}>
                      <div style={{ fontSize: 10, color: TEXT2, marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
                  ◆ {checkResult.type === "personal" ? t.sectionPersonal : t.sectionCompany}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(checkResult.type === "personal" ? [
                    [t.fldName, checkResult.firstName + " " + checkResult.lastName],
                    [t.fldPhone, checkResult.phone],
                    [t.fldEmail, checkResult.email || "-"],
                    [t.fldAddress, fmtAddr(checkResult.addr)],
                  ] : [
                    [t.fldCompanyType, checkResult.companyType || "-"],
                    [t.fldCompany, checkResult.companyName],
                    [t.fldBranch, checkResult.branchType === "HQ" ? t.hq : t.branch + " " + checkResult.branchNo],
                    [t.fldTax, checkResult.taxId || "-"],
                    [t.fldAddress, fmtAddr(checkResult.companyAddr)],
                  ]).map(([k, v]) => (
                    <div key={k} style={{ background: DARK3, borderRadius: 6, padding: "10px 14px", border: "1px solid " + BORDER }}>
                      <div style={{ fontSize: 10, color: TEXT2, marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: 11, color: TEXT2, textAlign: "center", letterSpacing: "0.05em" }}>{t.regCode}: {checkResult.id}</div>
              </div>
            )}
          </div>
        )}

        {/* ===== ADMIN LOGIN ===== */}
        {page === "admin" && !adminAuth && (
          <div style={{ ...sec, maxWidth: 360, margin: "0 auto" }}>
            <div style={secT}><span style={{ color: GOLD }}>◆</span> {t.adminPin}</div>
            <Inp type="password" value={adminPin} onChange={e => setAdminPin(e.target.value)} placeholder={t.pinPlaceholder}
              onKeyDown={e => { if (e.key === "Enter") { if (adminPin === ADMIN_PASSWORD) { setAdminAuth(true); setAdminError(""); } else setAdminError(t.wrongPin); } }} />
            {adminError && <div style={{ fontSize: 13, color: "#f87171", marginTop: 8 }}>{adminError}</div>}
            <button onClick={() => { if (adminPin === ADMIN_PASSWORD) { setAdminAuth(true); setAdminError(""); } else setAdminError(t.wrongPin); }}
              style={{ marginTop: 14, width: "100%", padding: "12px", borderRadius: 6, border: "none", background: GOLD, color: DARK, cursor: "pointer", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {t.loginBtn}
            </button>
          </div>
        )}

{/* ===== IMPORT ===== */}
        {page === "import" && profile?.role === "admin" && (
          <div>
            <button onClick={() => setPage("admin")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: TEXT2, fontSize: 13, marginBottom: 20, letterSpacing: "0.06em" }}>
              ← กลับ
            </button>
            <ImportExcel />
          </div>
        )}

        {/* ===== USERS ===== */}
        {page === "users" && profile?.role === "admin" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>◆ USER MANAGEMENT</div>
            <UserManager />
          </div>
        )}
        {/* ===== ADMIN DASHBOARD ===== */}
        {page === "admin" && adminAuth && !viewRecord && (
          <div>
            {loading && <div style={{ textAlign: "center", padding: 40, color: TEXT2, letterSpacing: "0.1em" }}>{t.loading}</div>}
            {!loading && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    [t.totalReg, records.length, GOLD, DARK3],
                    [t.nearExpire, expiringSoon.length, "#f59e0b", DARK3],
                    [t.expired, records.filter(r => daysLeft(r.purchaseDate, r.warrantyMonths) < 0).length, "#ef4444", DARK3],
                    [t.pmDue, pmDueRecords.length, "#22c55e", DARK3],
                  ].map(([label, val, color, bg]) => (
                    <div key={label} style={{ background: bg, borderRadius: 8, padding: "16px", border: "1px solid " + BORDER, borderTop: "2px solid " + color }}>
                      <div style={{ fontSize: 10, color: TEXT2, marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 14, background: DARK2, borderRadius: 6, padding: 4, border: "1px solid " + BORDER }}>
                  {[["all",t.filterAll],["pmdue",t.filterPMDue],["nearexp",t.filterNearExp],["expired",t.filterExpired]].map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)}
                      style={{ flex: 1, padding: "7px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: "none", background: filter === val ? GOLD : "transparent", color: filter === val ? DARK : TEXT2, fontWeight: filter === val ? 700 : 400, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: 14, position: "relative" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                    style={{ ...inp, paddingLeft: 14 }} />
                </div>
                <div style={{ borderRadius: 8, border: "1px solid " + BORDER, overflow: "hidden" }}>
                  {filtered.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: TEXT2, letterSpacing: "0.05em" }}>{t.noData}</div>}
                  {filtered.map((r, i) => {
                    const name = r.type === "personal" ? r.firstName + " " + r.lastName : r.companyName;
                    return (
                      <div key={r.id} style={{ borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? DARK2 : DARK3, padding: "14px 16px", transition: "background 0.15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: TEXT }}>{name}</div>
                            <div style={{ fontSize: 11, color: TEXT2, marginTop: 3, fontFamily: "monospace", letterSpacing: "0.05em" }}>{r.id}</div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
  <button onClick={() => { setViewRecord(r); setPmEdit(r.pm ? { ...r.pm, schedules: [...(r.pm.schedules || [])] } : { required: false, schedules: [] }); setActiveTab("info"); }}
    style={{ background: DARK, border: "1px solid " + BORDER, cursor: "pointer", color: GOLD, fontSize: 12, flexShrink: 0, padding: "6px 12px", borderRadius: 4, letterSpacing: "0.06em", fontWeight: 600 }}>VIEW</button>
  {profile?.role === "admin" && (
    <button onClick={async () => {
      if (!window.confirm("ยืนยันการลบรายการนี้?")) return;
      const { error } = await supabase.from("registrations").delete().eq("id", r.id);
      if (!error) setRecords(rs => rs.filter(x => x.id !== r.id));
    }}
      style={{ background: "#2d0e0e", border: "1px solid #7f1d1d", cursor: "pointer", color: "#f87171", fontSize: 12, flexShrink: 0, padding: "6px 12px", borderRadius: 4, letterSpacing: "0.06em", fontWeight: 600 }}>DEL</button>
  )}
</div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: TEXT2, letterSpacing: "0.03em" }}>
                          <span style={{ marginRight: 16, color: TEXT }}>{r.model}</span>
                          <span style={{ fontFamily: "monospace" }}>{r.serial}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                          <StatusBadge days={daysLeft(r.purchaseDate, r.warrantyMonths)} t={t} />
                          <PMBadge pmRequired={r.pm && r.pm.required} pmDate={nearestPmDate(r.pm)} t={t} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setPage("import")}
  style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 6, border: "1px solid " + BORDER, background: DARK2, color: TEXT, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", marginBottom: 8 }}>
  ↑ IMPORT EXCEL / CSV
</button>
                <button onClick={() => exportToCSV(filtered)}
                  style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 6, border: "1px solid " + BORDER, background: DARK2, color: GOLD, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em" }}>
                  ↓ EXPORT CSV
                </button>
                <div style={{ marginTop: 10, fontSize: 11, color: TEXT2, letterSpacing: "0.05em" }}>{t.showing(filtered.length, records.length)}</div>
              </div>
            )}
          </div>
        )}

        {/* ===== VIEW RECORD ===== */}
        {page === "admin" && adminAuth && viewRecord && (
          <div>
            <button onClick={() => setViewRecord(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, marginBottom: 16 }}>
              ← {t.back}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{viewRecord.type === "personal" ? viewRecord.firstName + " " + viewRecord.lastName : viewRecord.companyName}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{viewRecord.id}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <StatusBadge days={daysLeft(viewRecord.purchaseDate, viewRecord.warrantyMonths)} t={t} />
                <PMBadge pmRequired={viewRecord.pm && viewRecord.pm.required} pmDate={nearestPmDate(viewRecord.pm)} t={t} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #e2e8f0" }}>
              {[["info","👤 " + t.tabInfo],["pm","🔧 " + t.tabPM]].map(([tab, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: "10px 22px", border: "none", borderBottom: activeTab === tab ? "2px solid " + GOLD : "2px solid transparent", background: "none", color: activeTab === tab ? GOLD : "#64748b", cursor: "pointer", fontWeight: activeTab === tab ? 700 : 400, fontSize: 14 }}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {(viewRecord.type === "personal" ? [
                    [t.fldName, viewRecord.firstName + " " + viewRecord.lastName],
                    [t.fldIdCard, viewRecord.idCard || "-"],
                    [t.fldPhone, viewRecord.phone],
                    [t.fldEmail, viewRecord.email || "-"],
                    [t.fldAddress, fmtAddr(viewRecord.addr)],
                  ] : [
                    [t.fldCompanyType, viewRecord.companyType || "-"],
                    [t.fldCompany, viewRecord.companyName],
                    [t.fldBranch, viewRecord.branchType === "HQ" ? t.hq : t.branch + " " + viewRecord.branchNo],
                    [t.fldTax, viewRecord.taxId],
                    [t.fldPhone, viewRecord.companyPhone],
                    [t.fldContact, (viewRecord.contactFirstName || viewRecord.contactLastName) ? (viewRecord.contactFirstName + " " + viewRecord.contactLastName).trim() : "-"],
                    [t.fldEmail, viewRecord.companyEmail || "-"],
                    [t.fldAddress, fmtAddr(viewRecord.companyAddr)],
                  ]).map(([k, v]) => (
                    <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{k}</div>
                      <div style={{ fontSize: 14, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 18px", border: "0.5px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>📦 {t.detailProduct}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      [t.fldProduct, viewRecord.productType || "-"],
                      [t.fldBrand, viewRecord.brand === "Other" ? (viewRecord.brandOther || "Other") : (viewRecord.brand || "-")],
                      [t.fldModel, viewRecord.model],
                      [t.fldSerial, viewRecord.serial],
                      [t.fldPurchase, viewRecord.purchaseDate],
                      [t.fldWarranty, fmtWarranty(viewRecord.warrantyMonths, t)],
                      [t.fldExpire, (() => { const d = new Date(viewRecord.purchaseDate); d.setMonth(d.getMonth() + Number(viewRecord.warrantyMonths)); return d.toLocaleDateString("th-TH"); })()],
                      [t.fldReceipt, viewRecord.receipt || "-"],
                      {/* สถานที่ติดตั้ง — Admin/Staff เท่านั้น */}
              <div style={{ marginTop: 16, background: DARK3, borderRadius: 8, padding: "14px 16px", border: "1px solid " + BORDER }}>
                <div style={{ fontSize: 10, color: TEXT2, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>สถานที่ติดตั้ง</div>
                {editSite ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={siteValue} onChange={e => setSiteValue(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid " + BORDER, background: DARK2, color: TEXT, fontSize: 14 }}
                      placeholder="กรอกสถานที่ติดตั้ง" />
                    <button onClick={async () => {
                      await supabase.from("registrations").update({ installation_site: siteValue }).eq("id", viewRecord.id);
                      setViewRecord({ ...viewRecord, installationSite: siteValue });
                      setRecords(rs => rs.map(r => r.id === viewRecord.id ? { ...r, installationSite: siteValue } : r));
                      setEditSite(false);
                    }} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: GOLD, color: DARK, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      SAVE
                    </button>
                    <button onClick={() => setEditSite(false)}
                      style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid " + BORDER, background: "transparent", color: TEXT2, fontSize: 12, cursor: "pointer" }}>
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, color: TEXT }}>{viewRecord.installationSite || "-"}</div>
                    {(profile?.role === "admin" || profile?.role === "staff") && (
                      <button onClick={() => { setEditSite(true); setSiteValue(viewRecord.installationSite || ""); }}
                        style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + BORDER, background: DARK, color: GOLD, fontSize: 11, cursor: "pointer", fontWeight: 600, letterSpacing: "0.06em" }}>
                        EDIT
                      </button>
                    )}
                  </div>
                )}
              </div>
                      ["สถานที่ติดตั้ง", viewRecord.installationSite || "-"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pm" && (
              <div>
                {pmSaved && <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" }}>✓ {t.pmSaved}</div>}
                {pmEdit && (
                  <div style={sec}>
                    <div style={secT}>🔧 {t.pmSection}</div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      {[[true, t.pmRequired],[false, t.pmNotRequired]].map(([val, label]) => (
                        <button key={String(val)} onClick={() => setPmEdit({ ...pmEdit, required: val })}
                          style={{ flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 14, border: pmEdit.required === val ? "2px solid " + GOLD : "1px solid #e2e8f0", background: pmEdit.required === val ? DARK : "#f8fafc", color: pmEdit.required === val ? GOLD : "#64748b", fontWeight: pmEdit.required === val ? 700 : 400 }}>
                          {val ? "✅ " : "❌ "}{label}
                        </button>
                      ))}
                    </div>

                    {pmEdit.required && (
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 12 }}>📅 {t.pmSchedules}</div>
                        {(pmEdit.schedules || []).map((s, i) => (
                          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <span style={{ fontWeight: 500, fontSize: 13, color: GOLD }}>ครั้งที่ {i + 1}</span>
                              <button onClick={() => { const updated = pmEdit.schedules.filter((_, idx) => idx !== i); setPmEdit({ ...pmEdit, schedules: updated }); }}
                                style={{ background: "#fee2e2", border: "none", color: "#b91c1c", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                                🗑️ {t.pmDeleteSchedule}
                              </button>
                            </div>
                            <div style={g2}>
                              <Field label={t.pmDate}>
                                <Inp type="date" value={s.date || ""} onChange={e => { const updated = [...pmEdit.schedules]; updated[i] = { ...s, date: e.target.value }; setPmEdit({ ...pmEdit, schedules: updated }); }} />
                              </Field>
                              <Field label={t.pmAssign}>
                                <Inp value={s.assignee || ""} onChange={e => { const updated = [...pmEdit.schedules]; updated[i] = { ...s, assignee: e.target.value }; setPmEdit({ ...pmEdit, schedules: updated }); }} placeholder="ชื่อผู้รับผิดชอบ" />
                              </Field>
                              <div style={s2}>
                                <Field label={t.pmNote}>
                                  <textarea value={s.note || ""} onChange={e => { const updated = [...pmEdit.schedules]; updated[i] = { ...s, note: e.target.value }; setPmEdit({ ...pmEdit, schedules: updated }); }}
                                    rows={2} placeholder="รายละเอียดการ PM..." style={{ ...inp, resize: "vertical" }} />
                                </Field>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setPmEdit({ ...pmEdit, schedules: [...(pmEdit.schedules || []), { date: "", note: "", assignee: "" }] })}
                          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px dashed " + GOLD, background: "#fffbeb", color: GOLD2, fontSize: 14, cursor: "pointer", fontWeight: 500, marginBottom: 16 }}>
                          ➕ {t.pmAddSchedule}
                        </button>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={savePM} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid " + GOLD, background: DARK, color: GOLD, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                        💾 {t.save}
                      </button>
                      <button onClick={() => setViewRecord(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, cursor: "pointer" }}>
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}