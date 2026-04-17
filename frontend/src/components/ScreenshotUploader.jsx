/**
 * ScreenshotUploader.jsx — Multi-file drag & drop upload component.
 * 
 * Supports drag & drop and click-to-browse for uploading screenshots.
 * Shows preview thumbnails of uploaded files.
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const MAX_FILES = 8;
const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ScreenshotUploader({ files, onChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PNG, JPEG, and WebP images are accepted';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const validFiles = [];
    for (const file of newFiles) {
      if (files.length + validFiles.length >= MAX_FILES) break;
      const error = validateFile(file);
      if (!error) {
        validFiles.push(file);
      }
    }
    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
    }
  }, [files, onChange]);

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  // Drag & drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    addFiles(selected);
    e.target.value = ''; // Reset so same file can be re-selected
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-textPrimary">
        Screenshots <span className="text-textSecondary font-normal">(optional)</span>
      </label>

      {/* Drop Zone */}
      <div
        className={`drop-zone rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? 'active' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/[0.02]'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        id="screenshot-upload-zone"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-backgroundSoft flex items-center justify-center">
            <Upload className="w-6 h-6 text-accentGold" />
          </div>
          <div>
            <p className="text-sm font-medium text-textPrimary">
              Drag & drop screenshots here
            </p>
            <p className="text-xs text-textSecondary mt-0.5">
              or click to browse · PNG, JPEG, WebP · Max {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      </div>

      {/* Preview Thumbnails */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-primary/10 aspect-[9/16]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
              {/* File name */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}

          {/* Add more placeholder */}
          {files.length < MAX_FILES && (
            <div
              className="rounded-lg border-2 border-dashed border-primary/20 aspect-[9/16] flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
              onClick={handleClick}
            >
              <ImageIcon className="w-5 h-5 text-textSecondary/40" />
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-xs text-textSecondary">
          {files.length} of {MAX_FILES} screenshots uploaded
        </p>
      )}
    </div>
  );
}
