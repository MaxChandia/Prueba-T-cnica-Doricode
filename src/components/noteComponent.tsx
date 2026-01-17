import { useState } from "react";
import type { Note } from "../model/note";

interface NoteCardProps {
  note: Note;
}

export default function NoteComponent({ note }: NoteCardProps) {
  const [currentNote, setCurrentNote] = useState<Note>(note);
  const [isEditing, setIsEditing] = useState(false); 
  const [editTitle, setEditTitle] = useState(note.title);
  const [editUser, setEditUser] = useState(note.user);
  const [editContent, setEditContent] = useState(note.content);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const SERVER_URL = 'http://localhost:4000';

  /* Función para validación de campos */

  const validate = () => {
    const noteErrors: { [key: string]: string } = {};
    
    if (!editTitle.trim()) {
      noteErrors.title = "El título es obligatorio.";
    }
    
    if (!editUser.trim()) {
      noteErrors.user = "El usuario es obligatorio.";
    }
    
    if (!editContent.trim()) {
      noteErrors.content = "El contenido es obligatorio.";
    }

    setErrors(noteErrors);
    return Object.keys(noteErrors).length === 0;
  };

  /* Función para sincronizar con servidor */
  const syncWithServer = async (updatedNote: Note) => {
    try {
      const response = await fetch(`${SERVER_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([updatedNote])
      });
      
      if (response.ok) {
        console.log('Nota sincronizada correctamente');
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
    }
  };

  /* Función para eliminar nota */
  const deleteNote = () => {
    const deletedNote = {
      ...currentNote,
      deleted: true,
      updatedAt: Date.now()
    };
    
    setCurrentNote(deletedNote);
    syncWithServer(deletedNote);
    
    console.log(`Nota "${currentNote.title}" eliminada correctamente (ID: ${currentNote.id})`);
  };

  /* Función para guardar edición */
  const saveEdit = () => {

    if (!validate()) {
      console.log('Hay campos vacíos');
      return;
    }
    
    console.log('Valores anteriores:', {
      title: currentNote.title,
      user: currentNote.user,
      content: currentNote.content
    });
    console.log('Valores nuevos:', {
      title: editTitle,
      user: editUser,
      content: editContent
    });
    
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
    
    console.log(`Nota "${editTitle}" actualizada correctamente (ID: ${currentNote.id})`);
  };

   /* Función para cancelar edición */
  const cancelEdit = () => {
    setEditTitle(currentNote.title);
    setEditUser(currentNote.user);
    setEditContent(currentNote.content);
    setErrors({});
    setIsEditing(false);
  };

  if (currentNote.deleted) {
    return null;
  }

  /* Modo edición */

  if (isEditing) {
    return (
      <div className="bg-yellow-100 p-4 rounded-xl shadow-sm border border-blue-300">
        <div className="space-y-3">
          
          {/* Campo Título */}
          <div>
            <input
              type="text"
              className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 focus:ring-2 focus:ring-blue-500 outline-none`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          
          {/* Campo Usuario */}
          <div>
            <input
              type="text"
              className={`w-full p-2 border ${errors.user ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 focus:ring-2 focus:ring-blue-500 outline-none`}
              value={editUser}
              onChange={(e) => setEditUser(e.target.value)}
              placeholder="Usuario"
            />
            {errors.user && (
              <p className="text-xs text-red-500 mt-1">{errors.user}</p>
            )}
          </div>
          
          {/* Campo Contenido */}
          <div>
            <textarea
              className={`w-full p-2 border ${errors.content ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm bg-yellow-50 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none`}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Contenido"
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content}</p>
            )}
          </div>
          
          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={cancelEdit}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Modo visualización */
  return (
    <div className="bg-yellow-100 p-4 w-[200px] h-[200px] rounded-xl shadow-sm  border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">{currentNote.title}</h3>
        <span className="text-xs text-gray-400">
          {new Date(currentNote.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm whitespace-pre-wrap mb-4">
        {currentNote.content}
      </p>
      
        
        <div className=" flex gap-2">
          <button
            onClick={() => {
              setIsEditing(true);
            }}
            className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md transition-colors"
          >
            Editar
          </button>
          <button
            onClick={deleteNote}
            className="text-xs px-3 py-1 bg-transparent text-red-600 rounded-md transition-colors"
          >
            X
          </button>
      </div>
    </div>
  );
}