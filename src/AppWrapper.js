import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import App from "./App";

export default function AppWrapper() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เช็ค session ที่มีอยู่
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      }
      setLoading(false);
    });

    // ฟัง auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c9a84c", fontSize: 13, letterSpacing: "0.1em" }}>LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={(u, p) => { setUser(u); setProfile(p); }} />;
  }

  return <App user={user} profile={profile} onLogout={handleLogout} />;
}