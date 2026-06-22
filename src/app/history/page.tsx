import { redirect } from 'next/navigation';

export default function HistoryPage() {
  // Por ahora redirecciona a pacientes, el historial se ve dentro del paciente
  redirect('/patients');
}
