import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const ADMIN_PIN = "1234";

export default function Dashboard() {
  const [queue, setQueue] = useState([]);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authed) return;
    const q = query(collection(db, "queue"), orderBy("timestamp"));
    const unsub = onSnapshot(q, (snapshot) => {
      setQueue(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingData(false);
    });
    return () => unsub();
  }, [authed]);

  const handlePin = () => {
    if (pin === ADMIN_PIN) { setAuthed(true); setPinError(false); }
    else setPinError(true);
  };

  const markSeated = async (id) => {
    await updateDoc(doc(db, "queue", id), { status: "seated" });
  };

  const markServed = async (id) => {
    await updateDoc(doc(db, "queue", id), { status: "served" });
  };

  const waiting = queue.filter(q => q.status === "waiting");
  const seated = queue.filter(q => q.status === "seated");
  const served = queue.filter(q => q.status === "served");
  const pendingOrders = waiting.filter(q => q.order?.length > 0);
  const today = new Date().toDateString();
  const todayQueue = queue.filter(q => {
    if (!q.timestamp) return false;
    return new Date(q.timestamp.seconds * 1000).toDateString() === today;
  });
  const totalRevenue = todayQueue
    .filter(q => q.order?.length > 0)
    .reduce((sum, q) => sum + (q.order?.reduce((s, i) => s + i.price * i.qty, 0) || 0), 0);
  const todaySeated = todayQueue.filter(q => q.status === "seated" || q.status === "served").length;

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🍽️</div>
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Staff Access</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>Enter your PIN to continue</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePin()}
          placeholder="Enter PIN"
          style={{ width: "100%", padding: "12px", border: pinError ? "1px solid red" : "1px solid #ddd", borderRadius: "10px", fontSize: "18px", textAlign: "center", marginBottom: "12px", boxSizing: "border-box" }}
        />
        {pinError && <p style={{ color: "red", fontSize: "13px", marginBottom: "12px" }}>Incorrect PIN</p>}
        <button onClick={handlePin}
          style={{ width: "100%", padding: "14px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
          Login
        </button>
      </div>
    </div>
  );

  if (loadingData) return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>🍽️</div>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "white", letterSpacing: "-1px" }}>SmartQ</h1>
      <p style={{ color: "#666", marginTop: "8px", fontSize: "14px" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "#1a1a1a", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>SmartQ Dashboard</h1>
        <span style={{ background: "#333", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>Staff view</span>
      </div>

      <div style={{ padding: "1rem", maxWidth: "700px", margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
          {[
            { label: "Waiting", value: waiting.length },
            { label: "Seated today", value: todaySeated },
            { label: "Orders", value: pendingOrders.length },
            { label: "Today's revenue", value: `₹${totalRevenue}` },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "white", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <p style={{ color: "#666", fontSize: "11px", marginBottom: "4px" }}>{stat.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Waiting */}
        <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#1a1a1a" }}>Waiting queue</h2>
        {waiting.length === 0 && (
          <div style={{ background: "white", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎉</div>
            <p style={{ fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" }}>Queue is clear!</p>
            <p style={{ color: "#888", fontSize: "14px" }}>No one waiting right now</p>
          </div>
        )}
        {waiting.map((ticket, index) => (
          <div key={ticket.id} style={{ background: "white", borderRadius: "12px", padding: "1.25rem", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ background: "#1a1a1a", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: "700", fontSize: "16px" }}>Group of {ticket.groupSize}</span>
                  {ticket.sharing && (
                    <span style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>Sharing OK</span>
                  )}
                </div>
                {ticket.order?.length > 0 && (
                  <div style={{ background: "#f5f5f5", borderRadius: "8px", padding: "8px 12px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#666", marginBottom: "4px" }}>PRE-ORDER</p>
                    {ticket.order.map((item, i) => (
                      <p key={i} style={{ fontSize: "13px", color: "#1a1a1a", margin: "2px 0" }}>
                        {item.qty}x {item.name} — ₹{item.price * item.qty}
                      </p>
                    ))}
                    <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px" }}>
                      Total: ₹{ticket.order.reduce((s, i) => s + i.price * i.qty, 0)}
                    </p>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <button onClick={() => markSeated(ticket.id)}
                  style={{ background: "#1a1a1a", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Seat ✓
                </button>
                <span style={{ fontSize: "11px", color: "#888", textAlign: "right" }}>
                  📲 Customer notified on seat
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Seated */}
        {seated.length > 0 && (
          <>
            <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "1.5rem 0 12px", color: "#1a1a1a" }}>Seated</h2>
            {seated.map((ticket) => (
              <div key={ticket.id} style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: "600" }}>Group of {ticket.groupSize}</span>
                  {ticket.order?.length > 0 && (
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                      Order: {ticket.order.map(i => `${i.qty}x ${i.name}`).join(", ")}
                    </p>
                  )}
                </div>
                <button onClick={() => markServed(ticket.id)}
                  style={{ background: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Served ✓
                </button>
              </div>
            ))}
          </>
        )}

        {/* Served */}
        {served.length > 0 && (
          <>
            <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "1.5rem 0 12px", color: "#888" }}>Served today</h2>
            {served.map((ticket) => (
              <div key={ticket.id} style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "8px", opacity: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600" }}>Group of {ticket.groupSize}</span>
                <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "12px", padding: "4px 10px", borderRadius: "20px", fontWeight: "600" }}>Served</span>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}