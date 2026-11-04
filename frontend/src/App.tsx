import { Routes, Route } from "react-router-dom";
import Game from "@/pages/Game";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// The game itself is a single route — its screens are phases in persisted game state.
export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Game />} />
    </Routes>
  );
}
