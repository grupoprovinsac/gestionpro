"use client";

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    professional_name: 'Dra. Principal',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    duration_minutes: 30,
    procedure_name: '',
    status: 'Programada'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      
      const { data: pats } = await supabase.from('patients').select('id, first_name, last_name, dni').eq('org_id', orgId);
      if (pats) setPatients(pats);

      const { data: apps } = await supabase
        .from('appointments')
        .select(`*, patients (first_name, last_name, dni)`)
        .eq('org_id', orgId);
        
      if (apps) {
        setAppointments(apps);
        // Map to react-big-calendar events
        const formattedEvents = apps.map(app => {
          const startDate = new Date(`${app.date}T${app.start_time}`);
          const endDate = new Date(startDate.getTime() + app.duration_minutes * 60000);
          return {
            id: app.id,
            title: `${app.patients?.first_name} ${app.patients?.last_name} - ${app.procedure_name || 'Cita'}`,
            start: startDate,
            end: endDate,
            resource: app
          };
        });
        setEvents(formattedEvents);
      }
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (!orgs || orgs.length === 0) return;

    const { error } = await supabase.from('appointments').insert([
      { 
        org_id: orgs[0].id,
        ...formData
      }
    ]);

    if (!error) {
      setShowForm(false);
      fetchData();
      
      const p = patients.find(pat => pat.id === formData.patient_id);
      if (p && p.email) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: p.email,
            subject: 'Confirmación de Cita - GestionPro Dental',
            html: `<h3>Hola ${p.first_name},</h3><p>Tu cita para <strong>${formData.procedure_name || 'Consulta'}</strong> ha sido agendada para el <strong>${formData.date}</strong> a las <strong>${formData.start_time}</strong>.</p><p>Te esperamos.</p>`
          })
        });
      }

      setFormData({...formData, procedure_name: ''});
    } else {
      alert("Error al agendar cita: " + error.message);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Atendida': return '#2ecc71';
      case 'Cancelada': return '#e74c3c';
      default: return '#3b82f6';
    }
  }

  const eventStyleGetter = (event: any) => {
    const backgroundColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  return (
    <>
      <Topbar title="Agenda Clínica Interactiva" />
      <div className="content-area" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>

        {showForm && (
          <div className="panel" style={{ marginBottom: '24px', borderColor: 'var(--c-primary)', flexShrink: 0 }}>
            <div className="panel-header" style={{ background: 'var(--c-surface2)' }}>
              Agendar Nueva Cita
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Paciente</label>
                  <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="">-- Seleccionar Paciente --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.dni})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Fecha</label>
                  <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Hora de Inicio</label>
                  <input required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} type="time" style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Tratamiento / Motivo</label>
                  <input value={formData.procedure_name} onChange={e => setFormData({...formData, procedure_name: e.target.value})} type="text" placeholder="Ej: Profilaxis, Curación..." style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--c-text-2)' }}>Estado</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: '6px', color: '#fff' }}>
                    <option value="Programada">Programada</option>
                    <option value="Atendida">Atendida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn-primary">Guardar Cita</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text)', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-body" style={{ flex: 1, padding: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--c-muted)', padding: '40px' }}>Cargando calendario...</div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '600px', color: 'var(--c-text)' }}
                eventPropGetter={eventStyleGetter}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Lista"
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
