import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/pages/Dashboard";
import { Campaigns } from "@/pages/Campaigns";
import { CampaignDetail } from "@/pages/CampaignDetail";
import { LiveMonitor } from "@/pages/LiveMonitor";
import { Reports } from "@/pages/Reports";
import { Analytics } from "@/pages/Analytics";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { Header } from "@/components/layout/Header";
import { useUIStore } from "@/store/uiStore";

function NewCampaignPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="New Campaign" />
      <div className="p-4 md:p-6">
        <CampaignForm />
      </div>
    </div>
  );
}

export default function App() {
  const { sidebarOpen, closeSidebar } = useUIStore();

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeSidebar}
            />
          )}
        </AnimatePresence>

        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
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
