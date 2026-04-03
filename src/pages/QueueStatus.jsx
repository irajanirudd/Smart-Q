import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function QueueStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const unsubTicket = onSnapshot(doc(db, "queue", id), (snap) => {
      if (snap.exists()) setTicket({ id: snap.id, ...snap.data() });
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

  if (!ticket) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Loading...</p>
    </div>
  );

  if (ticket.status === "seated") return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "400px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Your table is ready!</h2>
        <p style={{ color: "#666" }}>Please proceed to your table</p>
      </div>
    </div>
  );

  const orderTotal = ticket.order?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "1.25rem 1.5rem", borderBottom: "1px solid #eee" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Queue Status</h1>
        <p style={{ color: "#666", fontSize: "13px" }}>SmartQ — live updates</p>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: "400px", margin: "0 auto" }}>

        {/* Position */}
        <div style={{ background: "white", borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "16px" }}>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Your position</p>
          <p style={{ fontSize: "72px", fontWeight: "700", color: "#1a1a1a", lineHeight: 1 }}>#{position || "—"}</p>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "8px" }}>
            {position > 1 ? `${position - 1} group(s) ahead of you` : "You're next!"}
          </p>
        </div>

        {/* Group info */}
        <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "#666" }}>Group size</span>
            <span style={{ fontWeight: "600" }}>{ticket.groupSize}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#666" }}>Table sharing</span>
            <span style={{ fontWeight: "600" }}>{ticket.sharing ? "Yes ✓" : "No"}</span>
          </div>
        </div>

        {/* Order section */}
        {ticket.order?.length > 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "16px" }}>
            <p style={{ fontWeight: "700", marginBottom: "12px", color: "#1a1a1a" }}>✅ Your pre-order</p>
            {ticket.order.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px" }}>{item.qty}x {item.name}</span>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #eee", marginTop: "12px", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "700" }}>Total</span>
              <span style={{ fontWeight: "700", fontSize: "18px" }}>₹{orderTotal}</span>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate(`/preorder/${id}`)}
            style={{ width: "100%", padding: "14px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "16px" }}>
            Pre-order food 🍽️
          </button>
        )}

      </div>
    </div>
  );
}