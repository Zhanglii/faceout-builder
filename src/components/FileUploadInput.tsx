import React from 'react';

interface FileUploadInputProps {
  onFileSelect: (file: File) => void;
}

/**
 * Component for file upload input with styled button.
 * Accepts text files (.txt, .json, .md) and images (.png, .jpg, .jpeg).
 */
export function FileUploadInput({ onFileSelect }: FileUploadInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <input
        ref={fileInputRef}
        id="fileUpload"
        type="file"
        accept=".txt,.json,.md,.png,.jpg,.jpeg"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        className="file-upload-button"
        title="Choose a snapshot image or text file"
      >
        + Choose File
      </button>
      <p className="upload-hint">PNG, JPG, TXT, JSON, or MD files</p>
    </div>
  );
}
