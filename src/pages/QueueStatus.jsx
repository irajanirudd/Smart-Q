import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function QueueStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTicket = onSnapshot(doc(db, "queue", id), (snap) => {
      if (snap.exists()) setTicket({ id: snap.id, ...snap.data() });
      setLoading(false);
    });

    const q = query(collection(db, "queue"), orderBy("timestamp"));
    const unsubQueue = onSnapshot(q, (snap) => {
      const waiting = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.status === "waiting");
      const pos = waiting.findIndex(d => d.id === id);
      setPosition(pos + 1);
    });

    return () => { unsubTicket(); unsubQueue(); };
  }, [id]);

  // Loading splash screen
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>🍽️</div>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "white", letterSpacing: "-1px" }}>SmartQ</h1>
      <p style={{ color: "#666", marginTop: "8px", fontSize: "14px" }}>Loading your queue...</p>
    </div>
  );

  if (ticket?.status === "seated" || ticket?.status === "served") return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "2.5rem", width: "90%", maxWidth: "400px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a1a", letterSpacing: "-0.5px" }}>Your table is ready!</h2>
        <p style={{ color: "#888", margin: "8px 0", fontSize: "15px" }}>Please proceed to your table</p>
      </div>
    </div>
  );

  const orderTotal = ticket?.order?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>

      {/* Header */}
      <div style={{ background: "white", padding: "1.25rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "22px" }}>🍽️</span>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#1a1a1a", margin: 0 }}>SmartQ</h1>
          <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>Live queue updates</p>
        </div>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "400px", margin: "0 auto" }}>

        {/* Token / Position */}
        <div style={{ background: "#1a1a1a", borderRadius: "20px", padding: "2rem", textAlign: "center", marginBottom: "16px" }}>
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Your token</p>
          <p style={{ fontSize: "80px", fontWeight: "800", color: "white", lineHeight: 1 }}>#{position || "—"}</p>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>
            {position > 1 ? `⏳ ${position - 1} group(s) ahead of you` : "🎯 You're next!"}
          </p>
        </div>

        {/* Group info */}
        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>👥 Group size</span>
            <span style={{ fontWeight: "700", fontSize: "15px" }}>{ticket?.groupSize} people</span>
          </div>
          <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "10px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>🤝 Table sharing</span>
            <span style={{ fontWeight: "700", fontSize: "15px", color: ticket?.sharing ? "#16a34a" : "#1a1a1a" }}>
              {ticket?.sharing ? "Yes ✓" : "No"}
            </span>
          </div>
        </div>

        {/* Order section */}
        {ticket?.order?.length > 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "16px" }}>
            <p style={{ fontWeight: "800", marginBottom: "12px", color: "#1a1a1a", fontSize: "15px" }}>✅ Your pre-order</p>
            {ticket.order.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "#444" }}>{item.qty}x {item.name}</span>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ height: "1px", background: "#f0f0f0", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "700", fontSize: "15px" }}>Total</span>
              <span style={{ fontWeight: "800", fontSize: "18px" }}>₹{orderTotal}</span>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate(`/preorder/${id}`)}
            style={{ width: "100%", padding: "16px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" }}>
            Pre-order food 🍽️
          </button>
        )}

      </div>
    </div>
  );
}