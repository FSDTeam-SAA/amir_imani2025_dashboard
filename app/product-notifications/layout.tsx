import { Sidebar } from "@/components/qr-code/sidebar";

export default function ProductNotificationsLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen"><Sidebar />{children}</div>;
}
