import cors from 'cors';
import { Note } from '../src/model/note';
import express from 'express';

const app = express();
app.use(cors());  
app.use(express.json());

let serverNotes: Note[] = [];

const PORT = 4000;

app.post('/sync', (req: express.Request, res: express.Response) => {
    const clientNotes: Note[] = req.body;
    
    clientNotes.forEach(clientNote => {
        const serverIndex = serverNotes.findIndex(n => n.id === clientNote.id);

        if (serverIndex === -1) {
            if (!clientNote.deleted) serverNotes.push(clientNote);
        } else {
            const serverNote = serverNotes[serverIndex];
            if (clientNote.updatedAt > serverNote.updatedAt) {
                if (clientNote.deleted) {
                    console.log(`Nota ${clientNote.id} eliminada `);
                    serverNotes = serverNotes.filter(n => n.id !== clientNote.id);
                } else {
                    console.log(`Nota ${clientNote.id} actualizada`);
                    serverNotes[serverIndex] = clientNote;
                }
            }
        }
    });
    res.json(serverNotes);
});

app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', notes: serverNotes.length });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});