import React from 'react';

interface FileUploadInputProps {
  onFileSelect: (file: File) => void;
}

/**
 * Component for file upload input.
 * Accepts text files (.txt, .json, .md) and images (.png, .jpg, .jpeg).
 */
export function FileUploadInput({ onFileSelect }: FileUploadInputProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="fileUpload">Upload snapshot/mock file or image:</label>
      <input
        id="fileUpload"
        type="file"
        accept=".txt,.json,.md,.png,.jpg,.jpeg"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
