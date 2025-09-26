import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DraggableTextData, StyledText, FontFamily } from '../types';
import { Icon } from './Icon';

type EditableValue = StyledText | DraggableTextData;
type Guides = { vertical: number | null; horizontal: number | null };

interface EditableTextProps {
    value: EditableValue;
    onChange: (newValue: Partial<EditableValue>) => void;
    isAdminMode: boolean;
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
    className?: string;
    inputClassName?: string;
    onSelect: () => void;
    isSelected: boolean;
    isDraggable?: boolean;
    containerRef?: React.RefObject<HTMLElement>; // For boundary checks
    onDelete?: () => void; // Allow deleting the element
    isDragModeActive?: boolean;
    onDragMove?: (guides: Guides) => void;
    onDragEnd?: () => void;
}

export const EditableText: React.FC<EditableTextProps> = (props) => {
    const { 
        isAdminMode, as: Component = 'span', className, inputClassName, 
        value, onChange, onSelect, isSelected, isDraggable, containerRef,
        onDelete, isDragModeActive, onDragMove, onDragEnd
    } = props;

    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(value.text);
    const elementRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [interaction, setInteraction] = useState({
        type: 'none', // 'dragging', 'resizing'
        startX: 0, startY: 0, startLeft: 0, startTop: 0,
    });
    
    useEffect(() => { setDraftText(value.text); }, [value.text]);
    useEffect(() => { if (!isAdminMode) setIsEditing(false); }, [isAdminMode]);
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing, draftText]);

    useEffect(() => {
        if (isSelected && elementRef.current) {
            elementRef.current.focus();
        }
    }, [isSelected]);

    const handleSave = () => {
        if (draftText.trim() === '') {
            setDraftText(value.text);
        } else if (draftText !== value.text) {
            onChange({ text: draftText });
        }
        setIsEditing(false);
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); e.currentTarget.blur(); } 
        else if (e.key === 'Escape') { setDraftText(value.text); setIsEditing(false); e.currentTarget.blur(); }
    };

    const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isAdminMode || !isSelected || !isDraggable || !('position' in value)) return;

        let moved = false;
        const moveAmount = e.shiftKey ? 2 : 0.5; // Coarse vs. fine movement
        const newPosition = { ...value.position };

        switch (e.key) {
            case 'ArrowUp':
                newPosition.y -= moveAmount;
                moved = true;
                break;
            case 'ArrowDown':
                newPosition.y += moveAmount;
                moved = true;
                break;
            case 'ArrowLeft':
                newPosition.x -= moveAmount;
                moved = true;
                break;
            case 'ArrowRight':
                newPosition.x += moveAmount;
                moved = true;
                break;
            case 'Delete':
            case 'Backspace':
                if (onDelete) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }
                break;
        }

        if (moved) {
            e.preventDefault();
            e.stopPropagation();
            
            // Clamp values between 0 and 100
            newPosition.x = Math.max(0, Math.min(100, newPosition.x));
            newPosition.y = Math.max(0, Math.min(100, newPosition.y));
            
            onChange({ position: newPosition });
        }
    };


    const handleMouseDown = useCallback((e: React.MouseEvent, type: 'dragging' | 'resizing') => {
        if (!isAdminMode || !isDraggable || !elementRef.current || !containerRef?.current) return;
        if (type === 'dragging' && !isDragModeActive) return;
        e.preventDefault(); e.stopPropagation();
        onSelect();

        const { clientX, clientY } = e;
        const elementRect = elementRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setInteraction({
            type, startX: clientX, startY: clientY,
            startLeft: elementRect.left - containerRect.left,
            startTop: elementRect.top - containerRect.top,
        });
    }, [isAdminMode, isDraggable, onSelect, containerRef, isDragModeActive]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (interaction.type === 'none' || !containerRef?.current || !elementRef.current) return;
        e.preventDefault(); e.stopPropagation();

        const { clientX, clientY } = e;
        const dx = clientX - interaction.startX;
        const dy = clientY - interaction.startY;
        const containerRect = containerRef.current.getBoundingClientRect();
        

        if (interaction.type === 'dragging' && 'position' in value) {
            const elementRect = elementRef.current.getBoundingClientRect();
            const newLeftPx = interaction.startLeft + dx;
            const newTopPx = interaction.startTop + dy;

            // Calculate element center and edges in pixels relative to container
            const elementCenterXPx = newLeftPx + elementRect.width / 2;
            const elementCenterYPx = newTopPx + elementRect.height / 2;

            // Snap logic
            const snapThreshold = 5; // 5 pixels
            let finalNewLeftPx = newLeftPx;
            let finalNewTopPx = newTopPx;
            const newGuides: Guides = { vertical: null, horizontal: null };

            // Horizontal snapping (vertical line)
            const containerCenterXPx = containerRect.width / 2;
            if (Math.abs(elementCenterXPx - containerCenterXPx) < snapThreshold) {
                finalNewLeftPx = containerCenterXPx - elementRect.width / 2;
                newGuides.vertical = 50;
            }

            // Vertical snapping (horizontal line)
            const containerCenterYPx = containerRect.height / 2;
            if (Math.abs(elementCenterYPx - containerCenterYPx) < snapThreshold) {
                finalNewTopPx = containerCenterYPx - elementRect.height / 2;
                newGuides.horizontal = 50;
            }
            
            if (onDragMove) {
                onDragMove(newGuides);
            }

            // Convert pixel position back to percentage for storage
            const newXPercent = (finalNewLeftPx + elementRect.width / 2) / containerRect.width * 100;
            const newYPercent = (finalNewTopPx + elementRect.height / 2) / containerRect.height * 100;
            
            onChange({ position: { x: newXPercent, y: newYPercent } });
        } else if (interaction.type === 'resizing') {
            const change = (dx + dy) * 0.05; // Sensitivity
            const newFontSize = Math.max(1, Math.min(15, value.fontSize + change));
            onChange({ fontSize: newFontSize });
        }
    }, [interaction, onChange, value, containerRef, onDragMove]);

    const handleMouseUp = useCallback(() => {
        if (onDragEnd) {
            onDragEnd();
        }
        setInteraction(prev => ({ ...prev, type: 'none' }));
    }, [onDragEnd]);

    useEffect(() => {
        if (interaction.type !== 'none') {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [interaction.type, handleMouseMove, handleMouseUp]);
    
    const textStyle: React.CSSProperties = {
        fontFamily: `'${value.fontFamily}', sans-serif`,
        fontSize: `${value.fontSize}rem`,
        color: value.color,
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
    };
    
    const containerStyle: React.CSSProperties = {};
    if (isDraggable && 'position' in value) {
        containerStyle.position = 'absolute';
        containerStyle.top = `${value.position.y}%`;
        containerStyle.left = `${value.position.x}%`;
        containerStyle.transform = 'translate(-50%, -50%)';
        containerStyle.whiteSpace = 'pre-wrap';
        containerStyle.textAlign = 'center';
    }

    const handleElementClick = (e: React.MouseEvent) => {
        if (isAdminMode) {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
        }
    };
    
    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isAdminMode) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };
    
    const finalClassName = [
        className,
        isAdminMode ? 'hover:outline-dashed hover:outline-2 hover:outline-amber-500/50 transition-all focus:outline-none' : '',
        isSelected ? 'outline-dashed outline-2 outline-blue-500' : '',
        isDraggable && isAdminMode ? (isDragModeActive ? 'cursor-move p-2' : 'cursor-default p-2') : '',
    ].filter(Boolean).join(' ');

    const titleText = isAdminMode && !isEditing
        ? (isDraggable && !isDragModeActive ? 'Activa el modo de movimiento para arrastrar' : 'Clic para seleccionar, doble clic para editar. Usa flechas para mover.')
        : '';


    if (isAdminMode && isEditing) {
        const finalInputClassName = `${inputClassName || className}`;
        const editingContainerStyle = { ...containerStyle, ...textStyle };

        // Explicitly define textarea styles to ensure WYSIWYG editing,
        // overriding default browser styles for form elements.
        const textareaStyle: React.CSSProperties = {
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontStyle: 'inherit',
            color: 'currentColor',
            lineHeight: 'inherit',
            textAlign: 'inherit',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            padding: 0,
            margin: 0,
            width: '100%',
            textShadow: 'none',
        };
        
        // Remove drop-shadow filters which can look odd during editing.
        const editingContainerClassName = finalClassName.replace(/drop-shadow-\w+/g, '');

        return (
            <div style={editingContainerStyle} className={editingContainerClassName} ref={elementRef}>
                <textarea
                    ref={textareaRef} value={draftText} onChange={(e) => setDraftText(e.target.value)}
                    onBlur={handleSave} onKeyDown={handleTextareaKeyDown}
                    className={finalInputClassName}
                    style={textareaStyle}
                    autoFocus rows={1}
                />
            </div>
        );
    }

    return (
        <div
            ref={elementRef}
            style={containerStyle}
            className={finalClassName}
            onClick={handleElementClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={(e) => handleMouseDown(e, 'dragging')}
            onKeyDown={handleContainerKeyDown}
            tabIndex={isAdminMode && isDraggable ? 0 : -1}
            title={titleText}
        >
            <Component className={className} style={textStyle}>
                {value.text}
            </Component>
            {isAdminMode && isDraggable && isSelected && (
                <>
                    <div
                        onMouseDown={(e) => handleMouseDown(e, 'resizing')}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-slate-800 cursor-se-resize"
                        title="Arrastra para cambiar tamaño"
                    />
                    {onDelete && (
                         <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center cursor-pointer hover:bg-red-600"
                            title="Eliminar (Supr)"
                            aria-label="Eliminar texto"
                        >
                            <Icon name="x-mark" className="w-3 h-3" strokeWidth={3} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};