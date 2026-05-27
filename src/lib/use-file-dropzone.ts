"use client";

import { useCallback, useState, type DragEvent } from "react";

type Options = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

type DropHandlers<T extends HTMLElement> = {
  onDragOver: (event: DragEvent<T>) => void;
  onDragEnter: (event: DragEvent<T>) => void;
  onDragLeave: (event: DragEvent<T>) => void;
  onDrop: (event: DragEvent<T>) => void;
};

export type FileDropzone<T extends HTMLElement> = {
  isDragging: boolean;
  dropHandlers: DropHandlers<T>;
};

/**
 * Generic drag-and-drop file dropzone state. Caller owns file validation and
 * any side-effects via the `onFiles` callback. Returned `dropHandlers` should
 * be spread on the element that acts as the drop target.
 */
export function useFileDropzone<T extends HTMLElement = HTMLElement>({
  onFiles,
  disabled = false,
}: Options): FileDropzone<T> {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback(
    (event: DragEvent<T>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [disabled],
  );

  const onDragEnter = useCallback(
    (event: DragEvent<T>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    (event: DragEvent<T>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [disabled],
  );

  const onDrop = useCallback(
    (event: DragEvent<T>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) return;
      onFiles(files);
    },
    [disabled, onFiles],
  );

  return {
    isDragging,
    dropHandlers: { onDragOver, onDragEnter, onDragLeave, onDrop },
  };
}
