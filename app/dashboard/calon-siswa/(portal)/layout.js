import SiswaSidebar from "../SiswaSidebar";

export default function PortalLayout({ children }) {
  return (
    <div className="sw-shell">
      <SiswaSidebar />
      <div className="sw-main">{children}</div>
    </div>
  );
}
