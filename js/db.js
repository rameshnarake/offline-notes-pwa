const DB_NAME = 'NotesMultiPageDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Error opening DB');
  });
}

// Save a note with optional image and audio Blobs
async function saveNote(title, content, imageFile, audioFile) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const note = {
      title: title || 'Untitled Note',
      content: content || '',
      imageBlob: imageFile || null,
      audioBlob: audioFile || null,
      timestamp: new Date().toLocaleString()
    };

    const request = store.add(note);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Failed to save note');
  });
}

// Get all saved notes
async function getAllNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to fetch notes');
  });
}

// Delete a note by ID
async function deleteNote(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Failed to delete note');
  });
}
