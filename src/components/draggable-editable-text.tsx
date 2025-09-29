
"use client";

import React from 'react';
import { DraggableTextData } from '@/lib/types';
import { EditableText } from './editable-text';
import { cn } from '@/lib/utils';
// Note: This is a simplified custom hook. For a real app, you'd use a robust library like react-draggable or dnd-kit.
import { useDraggable } from '@/hooks/use-draggable';

interface DraggableEditableTextProps {
    id: string;
    value: DraggableTextData;
    onUpdate: (newValue: Partial<DraggableTextData>) => void;
    bounds: 'parent' | HTMLElement;
    isAdminMode: boolean;
    isDraggingMode: boolean;
    onSelect: () => void;
    isSelected: boolean;
}

export const DraggableEditableText: React.FC<DraggableEditableTextProps> = ({
    value,
    onUpdate,
    bounds,
    isAdminMode,
    isDraggingMode,
    onSelect,
    isSelected,
}) => {

    const handleStop = (pos: {x: number, y: number}) => {
        onUpdate({ position: pos });
    };

    const { position, handleStart } = useDraggable({
      initialPosition: value.position,
      onStop: handleStop,
      bounds: bounds,
      enabled: isDraggingMode && isAdminMode,
    });
    
    if (!isAdminMode && !isDraggingMode) {
        return (
            <div
                className="absolute"
                style={{
                    left: `${value.position.x}%`,
                    top: `${value.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${value.fontSize}rem`,
                    color: value.color,
                    fontFamily: value.fontFamily,
                }}
            >
                {value.text}
            </div>
        );
    }
    

    return (
        <div
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            className={cn(
                "absolute p-2",
                isAdminMode && !isDraggingMode && 'cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-primary',
                isDraggingMode && 'cursor-move',
                isSelected && !isDraggingMode && 'outline-dashed outline-2 outline-primary'
            )}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
                if (!isDraggingMode) {
                    e.stopPropagation();
                    onSelect();
                }
            }}
        >
            <EditableText
                as="div"
                id={value.id}
                value={value}
                onUpdate={(val) => onUpdate(val)}
                className="text-center"
                isAdminMode={isAdminMode}
                onSelect={onSelect}
                isSelected={isSelected && !isDraggingMode}
            />
        </div>
    );
};
