import React from 'react';

interface ImagePreviewProps {
  imageSrc: string | null;
}

/**
 * Component for displaying uploaded image preview.
 * Shows nothing if no image is present.
 */
export function ImagePreview({ imageSrc }: ImagePreviewProps) {
  if (!imageSrc) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <img
        src={imageSrc}
        alt="uploaded snapshot"
        style={{ maxWidth: '100%', maxHeight: 300 }}
      />
    </div>
  );
}
