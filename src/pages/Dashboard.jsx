import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "queue"), orderBy("timestamp"));
    const unsub = onSnapshot(q, (snapshot) => {
      setQueue(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const markSeated = async (id) => {
    await updateDoc(doc(db, "queue", id), { status: "seated" });
  };

  const waiting = queue.filter(q => q.status === "waiting");
  const seated = queue.filter(q => q.status === "seated");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "#1a1a1a", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>SmartQ Dashboard</h1>
        <span style={{ background: "#333", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
          Staff view
        </span>
      </div>

      <div style={{ padding: "1rem", maxWidth: "700px", margin: "0 auto" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "4px" }}>Waiting</p>
            <p style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>{waiting.length}</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "4px" }}>Seated today</p>
            <p style={{ fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>{seated.length}</p>
          </div>
        </div>

        <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#1a1a1a" }}>
          Waiting queue
        </h2>

        {waiting.length === 0 && (
          <div style={{ background: "white", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "#888" }}>
            No one waiting right now
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
                    <span style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>
                      Sharing OK
                    </span>
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
                  </div>
                )}
              </div>

              <button onClick={() => markSeated(ticket.id)}
                style={{ background: "#1a1a1a", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>
                Seat ✓
              </button>
            </div>
          </div>
        ))}

        {seated.length > 0 && (
          <>
            <h2 style={{ fontSize: "16px", fontWeight: "700", margin: "1.5rem 0 12px", color: "#1a1a1a" }}>
              Seated
            </h2>
            {seated.map((ticket) => (
              <div key={ticket.id} style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "8px", opacity: 0.6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600" }}>Group of {ticket.groupSize}</span>
                <span style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: "12px", padding: "4px 10px", borderRadius: "20px", fontWeight: "600" }}>Seated</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}