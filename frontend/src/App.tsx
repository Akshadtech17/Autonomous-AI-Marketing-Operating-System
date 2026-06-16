import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { Campaigns } from "@/pages/Campaigns";
import { CampaignDetail } from "@/pages/CampaignDetail";
import { LiveMonitor } from "@/pages/LiveMonitor";
import { Reports } from "@/pages/Reports";
import { Analytics } from "@/pages/Analytics";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { Header } from "@/components/layout/Header";

function NewCampaignPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="New Campaign" />
      <div className="p-6">
        <CampaignForm />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={<NewCampaignPage />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/monitor" element={<LiveMonitor />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
