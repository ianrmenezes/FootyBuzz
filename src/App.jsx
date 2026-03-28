import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard/Dashboard";
import Matches from "./pages/Matches/Matches";
import Standings from "./pages/Standings/Standings";
import Scorers from "./pages/Scorers/Scorers";
import TeamDetail from "./pages/Team/TeamDetail";
import Favorites from "./pages/Favorites/Favorites";

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/scorers" element={<Scorers />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
