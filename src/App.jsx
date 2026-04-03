import { BrowserRouter, Routes, Route } from "react-router-dom";
import JoinQueue from "./pages/JoinQueue";
import QueueStatus from "./pages/QueueStatus";
import PreOrder from "./pages/PreOrder";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinQueue />} />
        <Route path="/status/:id" element={<QueueStatus />} />
        <Route path="/preorder/:id" element={<PreOrder />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}