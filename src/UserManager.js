import { useState, useEffect } from "react";
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
  fontFamily: "'Inter', sans-serif"
};
const lbl = {
  fontSize: 11, color: TEXT2, marginBottom: 6,
  display: "block", letterSpacing: "0.08em",
  textTransform: "uppercase", fontWeight: 500
};

function RoleBadge({ role }) {
  const styles = {
    admin: { background: "#2d1a00", color: GOLD, border: "1px solid #4a3000" },
    staff: { background: "#0d1f2d", color: "#60a5fa", border: "1px solid #1e3a5f" },
    customer: { background: "#1a1a1a", color: TEXT2, border: "1px solid " + BORDER },
  };
  return (
    <span style={{ ...styles[role] || styles.customer, fontSize: 10, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>
      {role || "customer"}
    </span>
  );
}

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("customer");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function updateRole() {
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", editUser.id);
    if (!error) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, role: newRole } : u));
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditUser(null); }, 1500);
    }
    setSaving(false);
  }

  async function addUser() {
    setAddError(""); setAddSuccess("");
    if (!newEmail || !newPassword || !newFullName) { setAddError("กรุณากรอกข้อมูลให้ครบ"); return; }
    setSaving(true);
    const { data, error } = await supabase.auth.admin.createUser({
      email: newEmail, password: newPassword,
      user_metadata: { full_name: newFullName, role: newUserRole },
      email_confirm: true
    });
    if (error) { setAddError(error.message); setSaving(false); return; }
    await supabase.from("user_profiles").update({ role: newUserRole, full_name: newFullName }).eq("id", data.user.id);
    setAddSuccess("เพิ่ม User สำเร็จ!");
    setNewEmail(""); setNewPassword(""); setNewFullName(""); setNewUserRole("customer");
    setSaving(false);
    loadUsers();
    setTimeout(() => { setAddSuccess(""); setShowAddUser(false); }, 2000);
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === "admin").length,
    staff: users.filter(u => u.role === "staff").length,
    customer: users.filter(u => u.role === "customer").length,
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          ["TOTAL USERS", stats.total, GOLD],
          ["ADMIN", stats.admin, GOLD],
          ["STAFF", stats.staff, "#60a5fa"],
          ["CUSTOMER", stats.customer, TEXT2],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: DARK2, borderRadius: 8, padding: "14px 16px", border: "1px solid " + BORDER, borderTop: "2px solid " + color }}>
            <div style={{ fontSize: 10, color: TEXT2, marginBottom: 6, letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา email, ชื่อ, role..."
          style={{ ...inp, flex: 1 }} />
        <button onClick={() => setShowAddUser(!showAddUser)}
          style={{ padding: "10px 18px", borderRadius: 6, border: "none", background: GOLD, color: DARK, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          + ADD USER
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div style={{ background: DARK2, borderRadius: 8, padding: "20px", marginBottom: 16, border: "1px solid " + BORDER, borderTop: "2px solid " + GOLD }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", marginBottom: 16 }}>◆ ADD NEW USER</div>
          {addError && <div style={{ padding: "10px", borderRadius: 6, marginBottom: 12, background: "#2d0e0e", color: "#f87171", border: "1px solid #7f1d1d", fontSize: 13 }}>{addError}</div>}
          {addSuccess && <div style={{ padding: "10px", borderRadius: 6, marginBottom: 12, background: "#0d2818", color: "#4ade80", border: "1px solid #166534", fontSize: 13 }}>✓ {addSuccess}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>ชื่อ - นามสกุล</label>
              <input style={inp} value={newFullName} onChange={e => setNewFullName(e.target.value)} placeholder="ชื่อ-นามสกุล" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Role</label>
              <select style={inp} value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addUser} disabled={saving}
              style={{ flex: 1, padding: "10px", borderRadius: 6, border: "none", background: saving ? DARK3 : GOLD, color: saving ? TEXT2 : DARK, fontWeight: 700, fontSize: 12, cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}>
              {saving ? "SAVING..." : "CREATE USER"}
            </button>
            <button onClick={() => { setShowAddUser(false); setAddError(""); }}
              style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid " + BORDER, background: "transparent", color: TEXT2, fontSize: 12, cursor: "pointer" }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      {saved && <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 12, background: "#0d2818", color: "#4ade80", border: "1px solid #166534", fontSize: 13 }}>✓ อัปเดต Role สำเร็จ</div>}

      <div style={{ borderRadius: 8, border: "1px solid " + BORDER, overflow: "hidden" }}>
        {loading && <div style={{ padding: 32, textAlign: "center", color: TEXT2, letterSpacing: "0.1em" }}>LOADING...</div>}
        {!loading && filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: TEXT2 }}>ไม่พบข้อมูล</div>}
        {!loading && filtered.map((u, i) => (
          <div key={u.id} style={{ borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? DARK2 : DARK3, padding: "14px 16px" }}>
            {editUser?.id === u.id ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: TEXT }}>{u.full_name || "-"}</div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{u.email}</div>
                </div>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                  style={{ ...inp, width: "auto", padding: "6px 10px" }}>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={updateRole} disabled={saving}
                  style={{ padding: "7px 14px", borderRadius: 4, border: "none", background: GOLD, color: DARK, fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em" }}>
                  {saving ? "..." : "SAVE"}
                </button>
                <button onClick={() => setEditUser(null)}
                  style={{ padding: "7px 14px", borderRadius: 4, border: "1px solid " + BORDER, background: "transparent", color: TEXT2, fontSize: 11, cursor: "pointer" }}>
                  CANCEL
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: TEXT }}>{u.full_name || "-"}</div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{u.email}</div>
                  <div style={{ marginTop: 8 }}><RoleBadge role={u.role} /></div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: TEXT2 }}>{new Date(u.created_at).toLocaleDateString("th-TH")}</div>
                  <button onClick={() => { setEditUser(u); setNewRole(u.role || "customer"); }}
                    style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid " + BORDER, background: DARK, color: GOLD, fontSize: 11, cursor: "pointer", letterSpacing: "0.06em", fontWeight: 600 }}>
                    EDIT ROLE
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: TEXT2, letterSpacing: "0.05em" }}>แสดง {filtered.length} จาก {users.length} users</div>
    </div>
  );
}