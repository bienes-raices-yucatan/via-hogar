
'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { DraggableTextData } from '@/lib/types';
import EditableText from '../editable-text';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableDraggableTextProps {
    data: DraggableTextData;
    sectionId: string;
    isAdminMode: boolean;
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
    isSelected,
    containerRef,
    onSelect,
    onUpdate,
    onDelete
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `text-${sectionId}-${data.id}`,
        disabled: !isAdminMode || !isSelected,
    });
    const nodeRef = useRef<HTMLDivElement>(null);
    const resizerRef = useRef<string | null>(null);

    const handleResize = useCallback((e: MouseEvent) => {
        if (!resizerRef.current || !nodeRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        let { width = 300, height = 50, position } = data;
        let newX = position.x;
        let newY = position.y;

        const dx = e.clientX - (containerRect.left + (position.x / 100 * containerRect.width));
        const dy = e.clientY - (containerRect.top + (position.y / 100 * containerRect.height));

        const right = (position.x / 100 * containerRect.width) + width;
        const bottom = (position.y / 100 * containerRect.height) + height;

        if (resizerRef.current.includes('right')) {
            width = e.clientX - (containerRect.left + (position.x / 100 * containerRect.width)) + (width/2) ;
        }
        if (resizerRef.current.includes('left')) {
            const oldRight = right;
            width = oldRight - e.clientX + containerRect.left;
            newX = (e.clientX - containerRect.left) / containerRect.width * 100;
        }

        if (resizerRef.current.includes('bottom')) {
            height = e.clientY - (containerRect.top + (position.y / 100 * containerRect.height)) + (height/2);
        }
        if (resizerRef.current.includes('top')) {
            const oldBottom = bottom;
            height = oldBottom - e.clientY + containerRect.top;
            newY = (e.clientY - containerRect.top) / containerRect.height * 100;
        }

        onUpdate({
            width: Math.max(50, width),
            height: Math.max(20, height),
            // position: { x: newX, y: newY }
        });

    }, [data, onUpdate, containerRef]);

    const stopResizing = useCallback(() => {
        resizerRef.current = null;
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    }, [handleResize]);

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [handleResize, stopResizing]);

    const handleResizerMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
        e.stopPropagation();
        resizerRef.current = direction;
        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = `${direction}-resize`;
    };
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${data.position.x}%`,
        top: `${data.position.y}%`,
        width: `${data.width}px`,
        height: `${data.height}px`,
        color: data.color,
        fontSize: `${data.fontSize}rem`,
        fontFamily: data.fontFamily,
        zIndex: isSelected ? 21 : 20,
        transform: `translate(-50%, -50%)`,
        boxShadow: isSelected ? '0 0 0 2px #FFB300' : 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0s',
    };

    if (transform && isDragging) {
        // Do not apply transform from useDraggable, as it is handled by the parent onDragMove
    }

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
                {isSelected && (
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
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-100"
                    >
                        <Trash2 size={14}/>
                    </button>
                    {resizers.map(dir => (
                        <div
                            key={dir}
                            onMouseDown={(e) => handleResizerMouseDown(e, dir)}
                            className={cn(
                                'absolute bg-white border-2 border-primary rounded-full w-3 h-3',
                                {
                                    'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize': dir === 'top-left',
                                    'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize': dir === 'top-right',
                                    'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize': dir === 'bottom-left',
                                    'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize': dir === 'bottom-right',
                                    'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize': dir === 'top',
                                    'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize': dir === 'bottom',
                                    'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize': dir === 'left',
                                    'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize': dir === 'right',
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
