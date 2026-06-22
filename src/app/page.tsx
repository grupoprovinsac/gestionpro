"use client";

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, FileText, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newPatients: 0,
    appointmentsToday: 0,
    incomeMonth: 0,
    debtTotal: 0
  });
  const [agendaHoy, setAgendaHoy] = useState<any[]>([]);
  const [deudas, setDeudas] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (!orgs || orgs.length === 0) {
      setLoading(false);
      return;
    }
    const orgId = orgs[0].id;

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // 1. Pacientes Nuevos (Este mes)
    const { count: patientsCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', startOfMonth);

    // 2. Citas Hoy
    const { data: citas } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name)')
      .eq('org_id', orgId)
      .eq('date', todayStr)
      .order('start_time', { ascending: true });

    // 3. Finanzas (Pagos)
    const { data: pagos } = await supabase
      .from('payments')
      .select('amount, status, created_at, patients(first_name, last_name)')
      .eq('org_id', orgId);

    let income = 0;
    let debt = 0;
    const deudasPendientes: any[] = [];

    if (pagos) {
      pagos.forEach(p => {
        if (p.status === 'Pagado' && p.created_at >= startOfMonth) {
          income += Number(p.amount);
        } else if (p.status === 'Pendiente') {
          debt += Number(p.amount);
          deudasPendientes.push(p);
        }
      });
    }

    setStats({
      newPatients: patientsCount || 0,
      appointmentsToday: citas?.length || 0,
      incomeMonth: income,
      debtTotal: debt
    });

    setAgendaHoy(citas || []);
    setDeudas(deudasPendientes);
    setLoading(false);
  }

  return (
    <>
      <Topbar title="Dashboard General" />
      <div className="content-area">
        {/* KPI Cards */}
        <div className="grid-cards">
          <div className="stat-card" style={{borderTop: '3px solid var(--c-primary)'}}>
            <div className="stat-header">
              <span className="stat-title">Pacientes Nuevos</span>
              <Users size={16} color="var(--c-muted)" />
            </div>
            <div className="stat-value">{stats.newPatients}</div>
            <div className="stat-sub">Este mes</div>
          </div>
          
          <div className="stat-card" style={{borderTop: '3px solid var(--c-success)'}}>
            <div className="stat-header">
              <span className="stat-title">Citas Hoy</span>
              <Calendar size={16} color="var(--c-muted)" />
            </div>
            <div className="stat-value">{stats.appointmentsToday}</div>
            <div className="stat-sub">Programadas</div>
          </div>

          <div className="stat-card" style={{borderTop: '3px solid var(--c-warning)'}}>
            <div className="stat-header">
              <span className="stat-title">Ingresos del Mes</span>
              <CreditCard size={16} color="var(--c-muted)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-warning)'}}>S/. {stats.incomeMonth.toFixed(2)}</div>
            <div className="stat-sub">Facturado este mes</div>
          </div>

          <div className="stat-card" style={{borderTop: '3px solid var(--c-danger)'}}>
            <div className="stat-header">
              <span className="stat-title">Cobranza Pendiente</span>
              <FileText size={16} color="var(--c-muted)" />
            </div>
            <div className="stat-value" style={{color: 'var(--c-danger)'}}>S/. {stats.debtTotal.toFixed(2)}</div>
            <div className="stat-sub">Deudas activas globales</div>
          </div>
        </div>

        {/* Main Dashboard Panels */}
        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              Agenda de Hoy ({new Date().toLocaleDateString()})
            </div>
            <div className="panel-body" style={{ padding: agendaHoy.length > 0 ? '0' : '60px 20px' }}>
              {loading ? (
                 <div style={{textAlign:'center', color:'var(--c-muted)'}}>Cargando...</div>
              ) : agendaHoy.length === 0 ? (
                <div style={{textAlign: 'center', color: 'var(--c-muted)'}}>
                  <Calendar size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                  <p>No hay citas programadas para hoy</p>
                  <Link href="/agenda" className="btn-primary" style={{display:'inline-flex', alignItems:'center', marginTop: '16px', textDecoration:'none'}}>
                    <Plus size={16} style={{marginRight:'4px'}} /> Agendar Cita
                  </Link>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column'}}>
                  {agendaHoy.map(cita => (
                     <div key={cita.id} style={{padding:'16px', borderBottom:'1px solid var(--c-border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                          <div style={{fontWeight:600}}>{cita.start_time.substring(0,5)}</div>
                          <div style={{fontSize:'13px', color:'var(--c-text-2)'}}>{cita.patients?.first_name} {cita.patients?.last_name}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:'13px', color:'var(--c-primary)', fontWeight:500}}>{cita.procedure_name}</div>
                          <div style={{fontSize:'11px', color:'var(--c-muted)'}}>{cita.status}</div>
                        </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              Cuentas por Cobrar
            </div>
            <div className="panel-body" style={{ padding: deudas.length > 0 ? '0' : '60px 20px' }}>
              {loading ? (
                 <div style={{textAlign:'center', color:'var(--c-muted)'}}>Cargando...</div>
              ) : deudas.length === 0 ? (
                <div style={{textAlign: 'center', color: 'var(--c-muted)'}}>
                  <CreditCard size={48} style={{margin: '0 auto 16px', opacity: 0.5}} />
                  <p>Felicidades, no hay deudas pendientes</p>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column'}}>
                  {deudas.map((deuda, i) => (
                     <div key={i} style={{padding:'16px', borderBottom:'1px solid var(--c-border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                          <div style={{fontWeight:500}}>{deuda.patients?.first_name} {deuda.patients?.last_name}</div>
                          <div style={{fontSize:'12px', color:'var(--c-text-2)'}}>{new Date(deuda.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{fontWeight:600, color:'var(--c-danger)'}}>
                          S/. {Number(deuda.amount).toFixed(2)}
                        </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
