
'use client';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { DraggableTextData } from '@/lib/types';
import EditableText from '../editable-text';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableDraggableTextProps {
    data: DraggableTextData;
    sectionId: string;
    isAdminMode: boolean;
    isDraggingMode: boolean;
    isSelected: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    onSelect: () => void;
    onUpdate: (updates: Partial<DraggableTextData>) => void;
    onDelete: () => void;
}

const ResizableDraggableText: React.FC<ResizableDraggableTextProps> = ({
    data,
    sectionId,
    isAdminMode,
    isDraggingMode,
    isSelected,
    containerRef,
    onSelect,
    onUpdate,
    onDelete
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `text-${sectionId}-${data.id}`,
        disabled: !isAdminMode || !isSelected || isDraggingMode,
    });
    const nodeRef = useRef<HTMLDivElement>(null);
    
    const resizeStartRef = useRef<{
        width: number;
        height: number;
        startX: number;
        startY: number;
        direction: string;
    } | null>(null);

    const handleResize = useCallback((e: MouseEvent) => {
        if (!resizeStartRef.current || !nodeRef.current) return;

        const { startX, startY, width: initialWidth, height: initialHeight, direction } = resizeStartRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = initialWidth;
        let newHeight = initialHeight;

        if (direction.includes('right')) newWidth = initialWidth + dx;
        if (direction.includes('left')) newWidth = initialWidth - dx;
        if (direction.includes('bottom')) newHeight = initialHeight + dy;
        if (direction.includes('top')) newHeight = initialHeight - dy;
        
        nodeRef.current.style.width = `${Math.max(50, newWidth)}px`;
        nodeRef.current.style.minHeight = `${Math.max(30, newHeight)}px`;
    }, []);

    const stopResizing = useCallback(() => {
        if (resizeStartRef.current && nodeRef.current) {
            onUpdate({ width: nodeRef.current.offsetWidth, height: nodeRef.current.offsetHeight });
        }
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
        resizeStartRef.current = null;
    }, [handleResize, onUpdate]);

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [handleResize, stopResizing]);

    const handleResizerMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
        e.stopPropagation();
        e.preventDefault();

        resizeStartRef.current = {
            width: data.width || 300,
            height: data.height || 50,
            startX: e.clientX,
            startY: e.clientY,
            direction: direction,
        };

        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = `${direction}-resize`;
    };
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${data.position.x}%`,
        top: `${data.position.y}%`,
        width: `${data.width}px`,
        color: data.color,
        fontSize: `${data.fontSize}rem`,
        fontFamily: data.fontFamily,
        zIndex: isSelected ? 21 : 20,
        transform: isDragging ? 
            `translate(calc(-50% + ${transform?.x}px), calc(-50% + ${transform?.y}px))` : 
            'translate(-50%, -50%)',
        boxShadow: isSelected ? '0 0 0 2px hsl(var(--primary))' : 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        minHeight: `${data.height}px`,
        height: 'auto',
    };

    const resizers = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'];

    return (
        <div
            ref={(el) => {
                setNodeRef(el);
                if(el) nodeRef.current = el;
            }}
            style={style}
            className={cn("group/text relative p-2 flex items-center justify-center text-center")}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
            <div 
              className="flex items-start gap-2 h-full w-full"
            >
                {isSelected && !isDraggingMode && (
                    <div 
                        {...listeners} 
                        {...attributes} 
                        className="cursor-grab text-white opacity-50 hover:opacity-100 transition-opacity absolute -left-6 top-1/2 -translate-y-1/2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={20} />
                    </div>
                )}
                <EditableText
                    value={data.text}
                    onChange={(val) => onUpdate({ text: val })}
                    isAdminMode={isAdminMode}
                    className="font-bold font-headline leading-tight w-full h-full"
                    as="div"
                    onSelect={onSelect}
                />
            </div>
            {isAdminMode && isSelected && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-100 z-30"
                    >
                        <Trash2 size={14}/>
                    </button>
                    {resizers.map(dir => (
                        <div
                            key={dir}
                            onMouseDown={(e) => handleResizerMouseDown(e, dir)}
                            className={cn(
                                'absolute bg-white border-2 border-primary rounded-full z-20',
                                {
                                    'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize w-3 h-3': dir === 'top-left',
                                    'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize w-3 h-3': dir === 'top-right',
                                    'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize w-3 h-3': dir === 'bottom-left',
                                    'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize w-3 h-3': dir === 'bottom-right',
                                    'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize w-10 h-2 rounded': dir === 'top',
                                    'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize w-10 h-2 rounded': dir === 'bottom',
                                    'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize w-2 h-10 rounded': dir === 'left',
                                    'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize w-2 h-10 rounded': dir === 'right',
                                }
                            )}
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default ResizableDraggableText;

    