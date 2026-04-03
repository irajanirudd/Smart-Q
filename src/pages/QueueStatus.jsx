import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function QueueStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [myTicket, setMyTicket] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const unsubMe = onSnapshot(doc(db, "queue", id), (docSnap) => {
      if (docSnap.exists()) {
        setMyTicket({ id: docSnap.id, ...docSnap.data() });
      }
    });

    const q = query(collection(db, "queue"), orderBy("timestamp"));
    const unsubAll = onSnapshot(q, (snapshot) => {
      const waiting = snapshot.docs.filter(d => d.data().status === "waiting");
      const pos = waiting.findIndex(d => d.id === id);
      setPosition(pos + 1);
    });

    return () => { unsubMe(); unsubAll(); };
  }, [id]);

  if (!myTicket) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Loading your queue status...</p>
    </div>
  );

  if (myTicket.status === "seated") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>Your table is ready!</h2>
          <p style={{ color: "#666", margin: "8px 0 24px" }}>Please head inside now</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2rem", width: "90%", maxWidth: "400px" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a" }}>SmartQ</h1>
          <p style={{ color: "#666", marginTop: "4px" }}>You're in the queue!</p>
        </div>

        <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>Your position</p>
          <p style={{ fontSize: "56px", fontWeight: "700", color: "#1a1a1a", lineHeight: 1 }}>#{position}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
          <div style={{ background: "#f5f5f5", borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>Group size</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{myTicket.groupSize}</p>
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "4px" }}>Est. wait</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{(position - 1) * 10}m</p>
          </div>
        </div>

        <button onClick={() => navigate(`/preorder/${id}`)}
          style={{ width: "100%", padding: "14px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
          Pre-order food while you wait
        </button>

      </div>
    </div>
  );
}