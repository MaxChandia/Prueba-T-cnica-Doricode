import { useState } from "react";
import type { Note } from "../model/note";

interface NoteCardProps {
  note: Note;
  onUpdate: () => void; // <--- AGREGA ESTO PARA QUITAR EL ERROR
}

export default function NoteComponent({ note, onUpdate }: NoteCardProps) {
  const [currentNote, setCurrentNote] = useState<Note>(note);
  const [isEditing, setIsEditing] = useState(false); 
  const [editTitle, setEditTitle] = useState(note.title);
  const [editUser, setEditUser] = useState(note.user);
  const [editContent, setEditContent] = useState(note.content);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const SERVER_URL = 'http://localhost:4000';

  /* Función para sincronizar y avisar al Dashboard */
  const syncWithServer = async (updatedNote: Note) => {
    // 1. Guardar en LocalStorage (Offline support)
    const localNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const newLocalNotes = localNotes.map((n: Note) => n.id === updatedNote.id ? updatedNote : n);
    localStorage.setItem("notes", JSON.stringify(newLocalNotes));

    // 2. Avisar al Dashboard para que refresque la UI
    onUpdate();

    // 3. Intentar sync con servidor
    try {
      await fetch(`${SERVER_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([updatedNote])
      });
    } catch (error) {
      console.warn('Servidor offline, nota guardada localmente.');
    }
  };

  const validate = () => {
    const noteErrors: { [key: string]: string } = {};
    if (!editTitle.trim()) noteErrors.title = "El título es obligatorio.";
    if (!editUser.trim()) noteErrors.user = "El usuario es obligatorio.";
    if (!editContent.trim()) noteErrors.content = "El contenido es obligatorio.";
    setErrors(noteErrors);
    return Object.keys(noteErrors).length === 0;
  };

  const deleteNote = () => {
    const deletedNote = { ...currentNote, deleted: true, updatedAt: Date.now() };
    setCurrentNote(deletedNote);
    syncWithServer(deletedNote);
  };

  const saveEdit = () => {
    if (!validate()) return;
    
    const updatedNote = {
      ...currentNote,
      title: editTitle,
      user: editUser,
      content: editContent,
      updatedAt: Date.now()
    };
    
    setCurrentNote(updatedNote);
    setIsEditing(false);
    setErrors({});
    syncWithServer(updatedNote);
  };

  const cancelEdit = () => {
    setEditTitle(currentNote.title);
    setEditUser(currentNote.user);
    setEditContent(currentNote.content);
    setErrors({});
    setIsEditing(false);
  };

  if (currentNote.deleted) return null;

  if (isEditing) {
    return (
      <div className="bg-yellow-100 p-4 rounded-xl shadow-sm border border-blue-300">
        <div className="space-y-3">
          <input
            type="text"
            className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 focus:ring-2 focus:ring-blue-500 outline-none`}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Título"
          />
          <input
            type="text"
            className={`w-full p-2 border ${errors.user ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 focus:ring-2 focus:ring-blue-500 outline-none`}
            value={editUser}
            onChange={(e) => setEditUser(e.target.value)}
            placeholder="Usuario"
          />
          <textarea
            className={`w-full p-2 border ${errors.content ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none`}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Contenido"
          />
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar</button>
            <button onClick={cancelEdit} className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 p-4 w-[300px] h-[200px] rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 truncate">{currentNote.title}</h3>
          <span className="text-[10px] text-gray-400 shrink-0">
            {new Date(currentNote.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-4 overflow-hidden whitespace-pre-wrap">
          {currentNote.content}
        </p>
      </div>
      
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-colors"
        >
          Editar
        </button>
        <button
          onClick={deleteNote}
          className="text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}