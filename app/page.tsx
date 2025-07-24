
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('notes').select('*')
    if (error) console.error('Error fetching notes:', error)
    else setNotes(data)
  }

  const createNote = async () => {
    const { data, error } = await supabase.from('notes').insert([{ content: newNote }])
    if (error) console.error('Error creating note:', error)
    else {
      fetchNotes()
      setNewNote('')
    }
  }

  const updateNote = async () => {
    if (!selectedNote) return
    const { data, error } = await supabase
      .from('notes')
      .update({ content: newNote })
      .eq('id', selectedNote.id)
    if (error) console.error('Error updating note:', error)
    else {
      fetchNotes()
      setNewNote('')
      setSelectedNote(null)
    }
  }

  const deleteNote = async (id: number) => {
    const { data, error } = await supabase.from('notes').delete().eq('id', id)
    if (error) console.error('Error deleting note:', error)
    else fetchNotes()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    const fileExt = selectedFile.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('test-images')
      .upload(fileName, selectedFile)

    if (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file!')
    } else {
      console.log('File uploaded successfully:', data)
      alert('File uploaded successfully!')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kolawal School</h1>
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 flex-grow"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="New note..."
        />
        <button onClick={createNote} className="bg-blue-500 text-white p-2 ml-2">
          Create
        </button>
        {selectedNote && (
          <button onClick={updateNote} className="bg-yellow-500 text-white p-2 ml-2">
            Update
          </button>
        )}
      </div>
      <div className="flex mb-4">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} className="bg-green-500 text-white p-2 ml-2">
          Upload File
        </button>
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="flex items-center justify-between border-b p-2">
            <span>{note.content}</span>
            <div>
              <button
                onClick={() => {
                  setSelectedNote(note)
                  setNewNote(note.content)
                }}
                className="bg-gray-300 p-1 mr-2"
              >
                Edit
              </button>
              <button onClick={() => deleteNote(note.id)} className="bg-red-500 text-white p-1">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
