'use client';

import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string | number;
  onChange: (value: string) => void;
  isAdminMode: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  onSelect?: () => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  isAdminMode,
  className,
  as: Component = 'div',
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setCurrentValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    if (isAdminMode) {
      setIsEditing(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isAdminMode) {
      e.stopPropagation(); // Prevent clicks from bubbling up to parent elements
      if (onSelect) {
        onSelect();
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(currentValue);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isAdminMode) {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${className} w-full p-0 m-0 bg-amber-100 border-none focus:ring-2 focus:ring-primary rounded-sm resize-none overflow-hidden`}
          onClick={(e) => e.stopPropagation()} // Prevent closing toolbar when clicking textarea
        />
      );
    }

    return (
      <Component
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        className={`${className} hover:outline hover:outline-2 hover:outline-amber-500 hover:outline-dashed rounded-sm transition-all cursor-pointer`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {value}
      </Component>
    );
  }

  return <Component className={className} style={{ whiteSpace: 'pre-wrap' }}>{value}</Component>;
};

export default EditableText;
