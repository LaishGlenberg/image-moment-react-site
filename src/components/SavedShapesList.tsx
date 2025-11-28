import React from 'react';
import type { SavedShape } from '../types/moments';

interface SavedShapesListProps {
  shapes: SavedShape[];
  activeShapeId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedShapesList: React.FC<SavedShapesListProps> = ({
  shapes,
  activeShapeId,
  onToggle,
  onDelete,
}) => {
  if (shapes.length === 0) {
    return (
      <div style={{
        padding: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--panel-bg)',
        textAlign: 'center',
        color: '#888',
        fontSize: '13px',
      }}>
        No saved shapes yet. 
        <br />
        <span style={{ fontSize: '12px' }}>Draw a shape and click "Save Shape"</span>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      backgroundColor: 'var(--panel-bg)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: '#fff',
      }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Saved Shapes</h3>
      </div>
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
      }}>
        {shapes.map((shape) => {
          const isActive = activeShapeId === shape.id;
          return (
            <div
              key={shape.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: isActive ? '#fee' : 'transparent',
              }}
            >
              <button
                onClick={() => onToggle(shape.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: isActive ? '#c00' : '#f0f0f0',
                  color: isActive ? '#fff' : '#333',
                  border: isActive ? '1px solid #a00' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: isActive ?  '#fff' : '#c00',
                }}></span>
                {shape.name}
                <span style={{ 
                  fontSize: '11px', 
                  color: isActive ? '#fcc' : '#888',
                  marginLeft: 'auto'
                }}>
                  {shape. pixels.length}px
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(shape.id);
                }}
                style={{
                  marginLeft: '8px',
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#888',
                  lineHeight: 1,
                }}
                title="Delete shape"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};