import React from 'react';
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

export const PlaceList: React.FC<PlaceListProps> = ({ isExpanded }) => {
  const { places, reorderPlaces } = useRouteStore();

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

  if (places.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white border border-dashed border-surface-300 rounded-xl">
        <p className="text-surface-500">No places added yet. Search above to add places to your itinerary!</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={places.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-3 transition-all duration-300 ${isExpanded ? '' : 'max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'} print:max-h-none print:overflow-visible`}>
          {places.map((place) => (
            <PlaceItem key={place.id} place={place} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
