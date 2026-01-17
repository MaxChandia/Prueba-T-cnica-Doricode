import { useState, useEffect } from 'react';
import type { Note } from '../model/note';
import NoteComponent from '../components/noteComponent';
import NoteModal from '../components/noteCreation';
import ServerStatus from './statusServer';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const SERVER_URL = 'http://localhost:4000';

  /* Cargar notas desde LocalStorage al montar el componente */

  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);


  /* Función para sincronizar notas con el servidor */

  const syncWithServer = async () => {
    try {
      setIsSyncing(true);
      const localNotes = JSON.parse(localStorage.getItem("notes") || "[]");    
      const response = await fetch(`${SERVER_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localNotes)
      });

      if (response.ok) {
        const serverNotes: Note[] = await response.json();
        setNotes(serverNotes);
        localStorage.setItem("notes", JSON.stringify(serverNotes));
        setIsOnline(true);
      }
    } catch (error) {
      console.error("Error sync:", error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  };

  /* Sync inicial al montar y cada 10 segundos */

  useEffect(() => {
    const interval = setInterval(syncWithServer, 10000);
    return () => clearInterval(interval);
  }, []);


  const activeNotes = notes.filter(n => !n.deleted);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Listado de notas</h1>
        </div>
        
        <ServerStatus isOnline={isOnline} isSyncing={isSyncing} />
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeNotes.map((note) => (
            <NoteComponent 
              key={note.id} 
              note={note}
              onUpdate={syncWithServer} 
            />
          ))}
        </div>
        
        {activeNotes.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400">No hay notas. Presiona el botón + para agregar.</p>
          </div>
        )}
      </main>

      {/* Botón Flotante */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-4xl shadow-2xl transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        +
      </button>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onNoteCreated={syncWithServer} 
      />
    </div>
  );
}