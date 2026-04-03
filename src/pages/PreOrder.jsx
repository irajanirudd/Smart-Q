import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const MENU = [
  { id: 1, name: "Butter Chicken", price: 280, category: "Main Course" },
  { id: 2, name: "Paneer Tikka", price: 220, category: "Starter" },
  { id: 3, name: "Biryani", price: 260, category: "Main Course" },
  { id: 4, name: "Garlic Naan", price: 50, category: "Bread" },
  { id: 5, name: "Dal Makhani", price: 180, category: "Main Course" },
  { id: 6, name: "Gulab Jamun", price: 80, category: "Dessert" },
  { id: 7, name: "Mango Lassi", price: 90, category: "Drinks" },
  { id: 8, name: "Samosa (2pcs)", price: 60, category: "Starter" },
];

export default function PreOrder() {
  const { id } = useParams();
  const [cart, setCart] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkExisting = async () => {
      const docSnap = await getDoc(doc(db, "queue", id));
      if (docSnap.exists() && docSnap.data().order?.length > 0) {
        setSubmitted(true);
      }
    };
    checkExisting();
  }, [id]);

  const addItem = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeItem = (item) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[item.id] > 1) updated[item.id]--;
      else delete updated[item.id];
      return updated;
    });
  };

  const total = MENU.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  const submitOrder = async () => {
    if (Object.keys(cart).length === 0) return alert("Add at least one item!");
    setLoading(true);
    const order = MENU
      .filter(item => cart[item.id])
      .map(item => ({ name: item.name, qty: cart[item.id], price: item.price }));
    await updateDoc(doc(db, "queue", id), { order });
    setLoading(false);
    window.location.href = `/status/${id}`;
  };

  const categories = [...new Set(MENU.map(i => i.category))];

  if (submitted) {
    window.location.href = `/status/${id}`;
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "1.25rem 1.5rem", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eee" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>Pre-order Menu</h1>
        <p style={{ color: "#666", fontSize: "13px" }}>Order now — food ready when you're seated</p>
      </div>

      <div style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{cat}</h3>
            {MENU.filter(item => item.category === cat).map(item => (
              <div key={item.id} style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: "600", color: "#1a1a1a", margin: 0 }}>{item.name}</p>
                  <p style={{ color: "#666", fontSize: "14px", margin: "2px 0 0" }}>₹{item.price}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {cart[item.id] ? (
                    <>
                      <button onClick={() => removeItem(item)}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ddd", background: "white", fontSize: "18px", cursor: "pointer" }}>−</button>
                      <span style={{ fontWeight: "700", minWidth: "20px", textAlign: "center" }}>{cart[item.id]}</span>
                    </>
                  ) : null}
                  <button onClick={() => addItem(item)}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: "#1a1a1a", color: "white", fontSize: "18px", cursor: "pointer" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {Object.keys(cart).length > 0 && (
        <div style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #eee", padding: "1rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontWeight: "600" }}>Total</span>
            <span style={{ fontWeight: "700", fontSize: "18px" }}>₹{total}</span>
          </div>
          <button onClick={submitOrder} disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : "#1a1a1a", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Placing order..." : "Confirm order"}
          </button>
        </div>
      )}
    </div>
  );
}