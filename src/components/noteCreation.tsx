import { useState } from "react";
import type { Note } from "../model/note";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: () => void;
}

export default function NoteModal({ isOpen, onClose, onNoteCreated }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [user, setUser] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const SERVER_URL = 'http://localhost:4000';

 /* Función para validación de campos */
  const validate = () => {
    const noteErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      noteErrors.title = "El título es obligatorio.";
    }
    
    if (!user.trim()) {
      noteErrors.user = "El usuario es obligatorio.";
    }
    
    if (!content.trim()) {
      noteErrors.content = "El contenido es obligatorio.";
    }

    setErrors(noteErrors);
    return Object.keys(noteErrors).length === 0;
  };

  /* Función para crear nota en el servidor */
  const createNote = async () => {
    if (!validate()) {
      console.log('Hay campos vacíos');
      return;
    }
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const uniqueId = `${timestamp}-${random}`;
    
    const newNote: Note = {
      id: uniqueId,
      user: user,
      title: title,
      content: content,
      createdAt: timestamp,
      updatedAt: timestamp,
      checked: false,
      deleted: false
    };

    const localNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const updatedLocalNotes = [...localNotes, newNote];
    localStorage.setItem("notes", JSON.stringify(updatedLocalNotes));

    
    onNoteCreated(); 

    setTitle('');
    setUser('');
    setContent('');
    setErrors({});
    onClose();

    try {
      const response = await fetch(`${SERVER_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newNote])
      });

      if (response.ok) {
        console.log(`Nota "${title}" sincronizada con el servidor`);
      }
    } catch (error) {
      console.warn('Servidor offline. La nota se sincronizará automáticamente al recuperar conexión.');
    }
  };

  /* Función para manejar cierre del modal */
  const handleClose = () => {
    setTitle('');
    setUser('');
    setContent('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Nota</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          
          {/* Campo Título */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Título</label>
            <input
              type="text"
              className={`w-full p-3 rounded-xl border ${errors.title ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título de la nota"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Campo Usuario */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Usuario</label>
            <input
              type="text"
              className={`w-full p-3 rounded-xl border ${errors.user ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
            {errors.user && <p className="text-xs text-red-500 mt-1">{errors.user}</p>}
          </div>

          {/* Campo Contenido */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Contenido</label>
            <textarea
              className={`w-full p-3 h-32 rounded-xl border ${errors.content ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ingresa el contenido de la nota"
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* Botones */}
          <div className="pt-4 flex gap-3">
            <button 
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={createNote}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Guardar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}