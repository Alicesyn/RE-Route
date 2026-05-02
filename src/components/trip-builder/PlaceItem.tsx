import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, MapPin } from 'lucide-react';
import { Place } from '../../types';
import { useRouteStore } from '../../store/useRouteStore';

interface PlaceItemProps {
  place: Place;
}

export const PlaceItem: React.FC<PlaceItemProps> = ({ place }) => {
  const { updatePlace, removePlace } = useRouteStore();
  const [isEditing, setIsEditing] = useState(false);
  const [desc, setDesc] = useState(place.description || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (desc !== place.description) {
      updatePlace(place.id, { description: desc, descriptionSource: 'user' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setDesc(place.description || '');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group card-place ${isDragging ? 'opacity-50 border-primary-500 shadow-md scale-[1.02]' : ''}`}
    >
      <div className="flex items-start p-4 gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-surface-400 hover:text-surface-600 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                {place.name}
              </h3>
              <p className="text-xs text-surface-500 mt-0.5 mb-2">{place.address}</p>
            </div>

            <button
              onClick={() => removePlace(place.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              aria-label="Remove place"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Inline Editable Description */}
          <div className="mt-1">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full text-sm text-surface-700 bg-surface-50 border border-primary-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none overflow-hidden"
                rows={1}
              />
            ) : (
              <p
                onClick={() => !isDragging && setIsEditing(true)}
                className="text-sm text-surface-600 cursor-text hover:bg-surface-50 p-2 -mx-2 rounded-lg transition-colors border border-transparent hover:border-surface-200 line-clamp-2"
                title="Click to edit"
              >
                {place.description || <span className="text-surface-400 italic">Click to add description...</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
