
"use client";

import React, { useRef } from 'react';
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
    // If there is no text and we're not in admin mode, render nothing.
    if (!isAdminMode && !value.text) {
        return null;
    }

    const handleContentChange = (e: ContentEditableEvent) => {
        onUpdate({ text: e.target.value });
    };

    const handleBlur = () => {
        // onUpdate is already called on change, so blur can be used for other logic if needed.
    };
    
    const textStyle: React.CSSProperties = {
        fontSize: `${value.fontSize}rem`,
        color: value.color,
        fontFamily: value.fontFamily,
        textAlign: value.textAlign || 'left',
        fontWeight: value.fontWeight || 'normal',
        padding: '0.1em 0.2em' // Added padding for indentation
    };

    if (!isAdminMode) {
        return (
            <Component
                className={className}
                style={textStyle}
                dangerouslySetInnerHTML={{ __html: value.text.replace(/\n/g, '<br />') }}
            />
        );
    }

    return (
        <ContentEditable
            html={value.text}
            tagName={Component}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.target as HTMLElement).blur();
                }
            }}
            className={cn(
                className,
                'transition-all duration-200 focus:outline-none whitespace-pre-wrap w-full rounded-sm',
                isAdminMode && 'cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-primary',
                isSelected && 'outline-dashed outline-2 outline-primary',
                !value.text && 'h-8' // Placeholder height when empty
            )}
            style={textStyle}
        />
    );
};

    