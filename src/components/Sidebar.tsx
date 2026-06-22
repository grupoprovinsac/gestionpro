"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  PieChart, 
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Activity className="sidebar-logo" color="var(--c-primary)" />
        <div className="sidebar-title">
          GestionPro
          <span>CRM Dental</span>
        </div>
      </div>

      <div className="org-selector">
        <div className="org-icon"><Activity size={18} /></div>
        <div className="org-name">Grupo Provin SAC<br/><span style={{fontSize:'11px', color:'var(--c-text-2)', fontWeight:400}}>Clínica Principal</span></div>
      </div>

      <nav className="nav-menu">
        <div className="nav-group">Principal</div>
        <Link href="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard /> Dashboard
        </Link>

        <div className="nav-group">Clínico</div>
        <Link href="/patients" className={`nav-item ${isActive('/patients')}`}>
          <Users /> Pacientes
        </Link>
        <Link href="/agenda" className={`nav-item ${isActive('/agenda')}`}>
          <Calendar /> Agenda
        </Link>
        <Link href="/history" className={`nav-item ${isActive('/history')}`}>
          <FileText /> Historia Clínica
        </Link>

        <div className="nav-group">Finanzas</div>
        <Link href="/payments" className={`nav-item ${isActive('/payments')}`}>
          <CreditCard /> Pagos
        </Link>

        <div className="nav-group">Reportes</div>
        <Link href="/reports" className={`nav-item ${isActive('/reports')}`}>
          <PieChart /> Estadísticas
        </Link>
      </nav>
    </aside>
  );
}
