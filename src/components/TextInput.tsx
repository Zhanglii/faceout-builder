import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

/**
 * Component for text input textarea.
 * Disabled when an image is uploaded (no text to edit).
 */
export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste snapshot content here..."
      rows={10}
      style={{ width: '100%' }}
      disabled={disabled}
    />
  );
}
