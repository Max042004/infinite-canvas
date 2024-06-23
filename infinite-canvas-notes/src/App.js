import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChromePicker } from 'react-color';
import Xarrow from 'react-xarrows';

const Note = ({ id, content, position, color, onMove, onContentChange, onColorChange, onStartConnecting }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        onMove(id, { x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, isDragging, onMove]);

  return (
    <div
      ref={noteRef}
      id={id}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: color,
        padding: '10px',
        borderRadius: '5px',
        cursor: isDragging ? 'grabbing' : 'grab',
        minWidth: '100px',
        minHeight: '50px',
      }}
      onMouseDown={() => setIsDragging(true)}
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => onContentChange(id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <div onClick={() => setIsEditing(true)}>{content}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: color,
            border: '1px solid black',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        <button onClick={() => onStartConnecting(id)}>Connect</button>
      </div>
      {showColorPicker && (
        <div style={{ position: 'absolute', zIndex: 1 }}>
          <ChromePicker
            color={color}
            onChange={(color) => onColorChange(id, color.hex)}
          />
        </div>
      )}
    </div>
  );
};

const InfiniteCanvasNotes = () => {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingNoteId, setConnectingNoteId] = useState(null);
  const canvasRef = useRef(null);

  const addNote = useCallback((x, y) => {
    const newNote = {
      id: `note-${Date.now()}`,
      content: '',
      position: { x, y },
      color: '#ffffff',
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
  }, []);

  const handleDoubleClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNote(x, y);
    }
  }, [addNote]);

  const moveNote = useCallback((id, newPosition) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
  }, []);

  const changeNoteContent = useCallback((id, newContent) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, content: newContent } : note
      )
    );
  }, []);

  const changeNoteColor = useCallback((id, newColor) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, color: newColor } : note
      )
    );
  }, []);

  const startConnecting = useCallback((noteId) => {
    setIsConnecting(true);
    setConnectingNoteId(noteId);
  }, []);

  const finishConnecting = useCallback((targetNoteId) => {
    if (isConnecting && connectingNoteId && connectingNoteId !== targetNoteId) {
      setConnections((prevConnections) => [
        ...prevConnections,
        { start: connectingNoteId, end: targetNoteId },
      ]);
      setIsConnecting(false);
      setConnectingNoteId(null);
    }
  }, [isConnecting, connectingNoteId]);

  return (
    <TransformWrapper>
      <TransformComponent>
        <div
          ref={canvasRef}
          style={{
            width: '5000px',
            height: '5000px',
            position: 'relative',
            backgroundColor: '#f0f0f0',
          }}
          onDoubleClick={handleDoubleClick}
          onClick={() => {
            if (isConnecting) {
              setIsConnecting(false);
              setConnectingNoteId(null);
            }
          }}
        >
          {notes.map((note) => (
            <Note
              key={note.id}
              {...note}
              onMove={moveNote}
              onContentChange={changeNoteContent}
              onColorChange={changeNoteColor}
              onStartConnecting={startConnecting}
            />
          ))}
          {connections.map((connection, index) => (
            <Xarrow
              key={index}
              start={connection.start}
              end={connection.end}
              color="black"
            />
          ))}
          {isConnecting && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Click on another note to connect, or anywhere else to cancel.
            </div>
          )}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default InfiniteCanvasNotes;
