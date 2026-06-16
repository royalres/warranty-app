import { useState } from "react";
import { supabase } from "./supabaseClient";

const GOLD = "#c9a84c";
const DARK = "#0a1628";
const DARK2 = "#0d1f3c";
const DARK3 = "#112244";
const BORDER = "#1e3a5f";
const TEXT = "#e8edf5";
const TEXT2 = "#7a9cc0";

const inp = {
  width: "100%", padding: "11px 14px", borderRadius: 6,
  border: "1px solid " + BORDER, background: DARK3,
  color: TEXT, fontSize: 14, boxSizing: "border-box",
  outline: "none", fontFamily: "'Inter', sans-serif"
};
const lbl = {
  fontSize: 11, color: TEXT2, marginBottom: 6,
  display: "block", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500
};

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setError(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).single();
    onLogin(data.user, profile);
    setLoading(false);
  }

  async function handleRegister() {
    setError("");
    if (!fullName) { setError("กรุณากรอกชื่อ-นามสกุล"); return; }
    if (password !== confirmPassword) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: "customer" } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setMessage("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
    setLoading(false);
  }

  async function handleForgot() {
    setError(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password"
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้วครับ");
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: "100vh", background: DARK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <img src="/res-logo.png" alt="Royal Group" style={{ height: 60, objectFit: "contain", marginBottom: 12 }} />
        <div style={{ fontSize: 11, color: TEXT2, letterSpacing: "0.12em", textTransform: "uppercase" }}>Warranty Registration System</div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: DARK2, borderRadius: 10, border: "1px solid " + BORDER, borderTop: "2px solid " + GOLD, padding: "32px 28px" }}>

        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
          {mode === "login" ? "— SIGN IN —" : mode === "register" ? "— CREATE ACCOUNT —" : "— RESET PASSWORD —"}
        </div>

        {/* Error / Message */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, background: "#2d0e0e", color: "#f87171", border: "1px solid #7f1d1d", fontSize: 13 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, background: "#0d2818", color: "#4ade80", border: "1px solid #166534", fontSize: 13 }}>
            {message}
          </div>
        )}

        {/* Form */}
        {mode === "register" && (
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>ชื่อ - นามสกุล</label>
            <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="กรอกชื่อ-นามสกุล" />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Email</label>
          <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>

        {mode !== "forgot" && (
          <div style={{ marginBottom: mode === "register" ? 16 : 24 }}>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
          </div>
        )}

        {mode === "register" && (
          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Confirm Password</label>
            <input style={inp} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}
          disabled={loading}
          style={{ width: "100%", padding: "12px", borderRadius: 6, border: "none", background: loading ? DARK3 : GOLD, color: loading ? TEXT2 : DARK, fontWeight: 700, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s", marginBottom: 20 }}>
          {loading ? "LOADING..." : mode === "login" ? "SIGN IN" : mode === "register" ? "CREATE ACCOUNT" : "SEND RESET LINK"}
        </button>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
  style={{ background: "none", border: "none", color: TEXT2, fontSize: 12, cursor: "pointer", letterSpacing: "0.05em" }}>
  Forgot Password?
</button>
<button onClick={() => { setMode("register"); setError(""); setMessage(""); }}
  style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", letterSpacing: "0.05em", fontWeight: 600 }}>
  Don't have an account? Sign up
</button>
            </>
          )}
          {(mode === "register" || mode === "forgot") && (
            <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
  style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", letterSpacing: "0.05em", fontWeight: 600 }}>
  ← Back to Sign In
</button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: TEXT2, letterSpacing: "0.05em" }}>
        © 2025 Royal Engineering Service Co., Ltd.
      </div>
    </div>
  );
}