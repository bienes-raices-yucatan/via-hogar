
"use client";

import React, { useState, useEffect, useRef } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { StyledText } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EditableTextProps {
    id: string;
    as?: React.ElementType;
    value: StyledText;
    onUpdate: (newValue: Partial<StyledText>) => void;
    className?: string;
    isAdminMode: boolean;
    onSelect: () => void;
    isSelected: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
    as: Component = 'div',
    value,
    onUpdate,
    className,
    isAdminMode,
    onSelect,
    isSelected,
}) => {
    const [currentText, setCurrentText] = useState(value.text);
    const hasChangedRef = useRef(false);

    // Update internal state if the prop changes from outside
    useEffect(() => {
        setCurrentText(value.text);
    }, [value.text]);

    const handleContentChange = (e: ContentEditableEvent) => {
        setCurrentText(e.target.value);
        hasChangedRef.current = true;
    };

    const handleBlur = () => {
        if (hasChangedRef.current) {
            onUpdate({ text: currentText });
            hasChangedRef.current = false;
        }
    };
    
    if (!isAdminMode) {
        return (
            <Component
                className={className}
                style={{
                    fontSize: `${value.fontSize}rem`,
                    color: value.color,
                    fontFamily: value.fontFamily,
                }}
            >
                {value.text}
            </Component>
        );
    }

    return (
        <ContentEditable
            html={currentText}
            tagName={Component}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={cn(
                className,
                'transition-all duration-200 focus:outline-none',
                isAdminMode && 'cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-primary',
                isSelected && 'outline-dashed outline-2 outline-primary'
            )}
            style={{
                fontSize: `${value.fontSize}rem`,
                color: value.color,
                fontFamily: value.fontFamily,
            }}
        />
    );
};

    