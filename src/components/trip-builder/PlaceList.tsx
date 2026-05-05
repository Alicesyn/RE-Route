import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlaceItem } from './PlaceItem';
import { useRouteStore } from '../../store/useRouteStore';

interface PlaceListProps {
  isExpanded: boolean;
}

type FilterTab = 'all' | 'unassigned';

export const PlaceList: React.FC<PlaceListProps> = ({ isExpanded }) => {
  const { places, reorderPlaces } = useRouteStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts, allows clicking inner elements
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = places.findIndex((p) => p.id === active.id);
      const newIndex = places.findIndex((p) => p.id === over.id);
      reorderPlaces(arrayMove(places, oldIndex, newIndex));
    }
  };

  const unassignedCount = places.filter(p => p.dayIndex === null).length;

  const filteredPlaces = activeTab === 'unassigned'
    ? places.filter(p => p.dayIndex === null)
    : places;

  if (places.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white border border-dashed border-surface-300 rounded-xl">
        <p className="text-surface-500">No places added yet. Search above to add places to your itinerary!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-3 bg-surface-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all ${
            activeTab === 'all'
              ? 'bg-white text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          All <span className="ml-1 opacity-60">({places.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all ${
            activeTab === 'unassigned'
              ? 'bg-white text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          Unassigned
          {unassignedCount > 0 && (
            <span className={`ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1 ${
              activeTab === 'unassigned'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-surface-200 text-surface-600'
            }`}>
              {unassignedCount}
            </span>
          )}
        </button>
      </div>

      {filteredPlaces.length === 0 ? (
        <div className="text-center py-8 px-4 bg-white border border-dashed border-surface-300 rounded-xl">
          <p className="text-surface-500 text-sm">
            {activeTab === 'unassigned'
              ? 'All places are assigned to a day!'
              : 'No places match this filter.'
            }
          </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredPlaces.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`space-y-3 transition-all duration-300 ${isExpanded ? '' : 'max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'} print:max-h-none print:overflow-visible`}>
              {filteredPlaces.map((place) => (
                <PlaceItem key={place.id} place={place} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
