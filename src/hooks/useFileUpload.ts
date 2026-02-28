import { useState, useCallback } from 'react';

/**
 * Hook for managing file upload logic.
 * Handles both text files and image uploads separately.
 */
export function useFileUpload() {
  const [snapshot, setSnapshot] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setSnapshot('');
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setSnapshot(reader.result as string);
        setImageSrc(null);
      };
      reader.readAsText(file);
    }
  }, []);

  const clearFiles = useCallback(() => {
    setSnapshot('');
    setImageSrc(null);
  }, []);

  return {
    snapshot,
    imageSrc,
    setSnapshot,
    handleFileSelect,
    clearFiles,
    hasContent: !!snapshot || !!imageSrc,
    content: imageSrc || snapshot,
  };
}
