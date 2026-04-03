import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function JoinQueue() {
  const [groupSize, setGroupSize] = useState(1);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const [sharingCount, setSharingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "queue"), where("status", "==", "waiting"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      setWaitingCount(docs.length);
      setSharingCount(docs.filter(d => d.sharing).length);
    });
    return () => unsub();
  }, []);

  const joinQueue = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "queue"), {
        groupSize,
        sharing,
        status: "waiting",
        order: [],
        timestamp: serverTimestamp(),
      });
      navigate(`/status/${docRef.id}`);
    } catch (e) {
      alert("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const estWait = waitingCount * 10;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "2rem", width: "90%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🍽️</div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a1a", letterSpacing: "-1px" }}>SmartQ</h1>
          <p style={{ color: "#888", marginTop: "4px", fontSize: "14px" }}>Skip the line — join digitally</p>
        </div>

        {/* Live stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
          <div style={{ background: "#f5f5f5", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>⏳</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>{waitingCount}</p>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Waiting</p>
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>🤝</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>{sharingCount}</p>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Sharing</p>
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>🕐</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>{estWait}m</p>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>Est. wait</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "1.5rem" }} />

        {/* Group size */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "700", marginBottom: "12px", color: "#1a1a1a", fontSize: "15px" }}>
            👥 Group size
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", justifyContent: "center" }}>
            <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
              style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid #ddd", background: "white", fontSize: "22px", cursor: "pointer", fontWeight: "700" }}>−</button>
            <span style={{ fontSize: "32px", fontWeight: "800", minWidth: "40px", textAlign: "center", color: "#1a1a1a" }}>{groupSize}</span>
            <button onClick={() => setGroupSize(Math.min(10, groupSize + 1))}
              style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", background: "#1a1a1a", color: "white", fontSize: "22px", cursor: "pointer", fontWeight: "700" }}>+</button>
          </div>
        </div>

        {/* Sharing */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "14px", background: sharing ? "#f0fdf4" : "#f5f5f5", borderRadius: "12px", border: sharing ? "1.5px solid #86efac" : "1.5px solid transparent", transition: "all 0.2s" }}>
            <input type="checkbox" checked={sharing} onChange={(e) => setSharing(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#1a1a1a" }} />
            <div>
              <p style={{ fontWeight: "700", color: "#1a1a1a", margin: 0 }}>🤝 I'm okay sharing a table</p>
              <p style={{ color: "#888", fontSize: "12px", margin: "2px 0 0" }}>Helps you get seated faster</p>
            </div>
          </label>
        </div>

        {/* Button */}
        <button onClick={joinQueue} disabled={loading}
          style={{ width: "100%", padding: "16px", background: loading ? "#ccc" : "#1a1a1a", color: "white", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "-0.3px" }}>
          {loading ? "Joining..." : "Join Queue →"}
        </button>
      </div>
    </div>
  );
}