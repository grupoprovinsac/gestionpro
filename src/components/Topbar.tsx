import { Menu, Plus } from 'lucide-react';

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <Menu size={20} color="var(--c-text-2)" style={{cursor: 'pointer'}} />
        {title}
      </div>
      <button className="btn-primary">
        <Plus size={16} /> Nueva Cita
      </button>
    </header>
  );
}
