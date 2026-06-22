"use client";

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import { supabase } from '@/lib/supabase';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import './calendar.css';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Calendar State
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  const [formData, setFormData] = useState({
    patient_id: '',
    professional_name: 'Dra. Principal',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    duration_minutes: 60,
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

  // --- Custom Calendar Logic ---
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para Lunes
    return new Date(d.setDate(diff));
  }

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  const goToToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const weekDates = Array.from({length: 7}).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Atendida': return 'var(--c-success)'; // Verde
      case 'Cancelada': return 'var(--c-danger)'; // Rojo
      default: return 'var(--c-primary)'; // Azul
    }
  }

  const hours = Array.from({length: 13}).map((_, i) => i + 8); // 8:00 to 20:00

  // --- End Custom Calendar Logic ---

  return (
    <>
      <Topbar title="Agenda Clínica" />
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

        {/* Custom Calendar UI */}
        <div className="calendar-wrapper">
          <div className="calendar-header">
            <div className="calendar-title">
              {weekDates[0].toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="calendar-nav">
              <button onClick={prevWeek}><ChevronLeft size={16} /></button>
              <button className="today-btn" onClick={goToToday}>Hoy</button>
              <button onClick={nextWeek}><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="calendar-grid-container">
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--c-muted)' }}>Cargando agenda...</div>
            ) : (
              <div className="calendar-grid">
                {/* Headers */}
                <div className="calendar-day-header" style={{ borderRight: '1px solid var(--c-border)' }}></div>
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`calendar-day-header ${isToday ? 'today' : ''}`}>
                      <div>{daysOfWeek[i]}</div>
                      <div className="date-num">{date.getDate()}</div>
                    </div>
                  );
                })}

                {/* Grid Body */}
                <div className="calendar-time-axis">
                  {hours.map(hour => (
                    <div key={hour} className="calendar-time-slot">
                      <span className="time-label">{hour}:00</span>
                    </div>
                  ))}
                </div>

                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvents = appointments.filter(a => a.date === dateStr);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div key={dayIndex} className={`calendar-day-col ${isToday ? 'today' : ''}`}>
                      {/* Background dashed cells */}
                      {hours.map(hour => (
                        <div key={hour} className="calendar-cell"></div>
                      ))}

                      {/* Events positioned absolutely */}
                      {dayEvents.map(event => {
                        const [h, m] = event.start_time.split(':').map(Number);
                        const startTotalMinutes = (h - 8) * 60 + m; // Relative to 8:00 AM
                        
                        // Si la cita es antes de las 8am o después de las 8pm, la ocultamos o ajustamos
                        if (h < 8 || h > 20) return null;

                        const topPosition = (startTotalMinutes / 60) * 60; // 60px por hora
                        const heightPx = (event.duration_minutes / 60) * 60;

                        return (
                          <div 
                            key={event.id} 
                            className="calendar-event"
                            style={{ 
                              top: `${topPosition}px`, 
                              height: `${heightPx}px`,
                              backgroundColor: getStatusColor(event.status)
                            }}
                            title={`${event.procedure_name} - ${event.patients?.first_name}`}
                          >
                            <div className="event-title">{event.patients?.first_name} {event.patients?.last_name}</div>
                            <div className="event-time">{event.start_time.substring(0,5)} - {event.procedure_name || 'Cita'}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
