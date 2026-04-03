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
      <div style={{ background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "400px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a" }}>SmartQ</h1>
          <p style={{ color: "#666", marginTop: "4px" }}>Join the queue — no waiting outside</p>
        </div>

        {/* Live stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
          <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{waitingCount}</p>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Waiting</p>
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{sharingCount}</p>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Sharing</p>
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{estWait}m</p>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>Est. wait</p>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#1a1a1a" }}>
            Group size
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #ddd", background: "white", fontSize: "20px", cursor: "pointer" }}>−</button>
            <span style={{ fontSize: "24px", fontWeight: "700", minWidth: "30px", textAlign: "center" }}>{groupSize}</span>
            <button onClick={() => setGroupSize(Math.min(10, groupSize + 1))}
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #ddd", background: "white", fontSize: "20px", cursor: "pointer" }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={sharing} onChange={(e) => setSharing(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }} />
            <span style={{ fontWeight: "600", color: "#1a1a1a" }}>I'm okay sharing a table</span>
          </label>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "4px", marginLeft: "30px" }}>
            Helps you get seated faster
          </p>
        </div>

        <button onClick={joinQueue} disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : "#1a1a1a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Joining..." : "Join Queue"}
        </button>
      </div>
    </div>
  );
}