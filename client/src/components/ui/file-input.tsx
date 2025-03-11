import * as React from "react";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesChange: (files: File[]) => void;
  existingFiles?: { name: string; url: string }[];
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  error?: string;
}

export function FileInput({
  onFilesChange,
  existingFiles = [],
  maxFiles = 5,
  maxSize = 10, // 10MB default
  accept = "image/*, application/pdf",
  className,
  error,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(
      (file) => file.size <= maxSize * 1024 * 1024
    );
    
    if (validFiles.length + files.length > maxFiles) {
      alert(`Maksimal ${maxFiles} file`);
      return;
    }

    if (validFiles.length !== fileArray.length) {
      alert(`Ukuran file maksimal ${maxSize}MB`);
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-medium border-dashed rounded-md relative",
          dragActive ? "border-primary bg-primary/5" : "border-neutral-300",
          error ? "border-destructive" : "",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-neutral-400" />
          <div className="flex text-sm text-neutral-600">
            <label
              htmlFor={props.id}
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark"
            >
              <span>Unggah file</span>
              <input
                ref={inputRef}
                id={props.id}
                name={props.name}
                type="file"
                className="sr-only"
                accept={accept}
                multiple
                onChange={(e) => handleFileChange(e.target.files)}
                {...props}
              />
            </label>
            <p className="pl-1">atau tarik dan lepas</p>
          </div>
          <p className="text-xs text-neutral-500">
            {accept.includes("image") && accept.includes("pdf")
              ? "PNG, JPG, PDF hingga "
              : accept.includes("image")
              ? "PNG, JPG hingga "
              : "PDF hingga "}
            {maxSize}MB (max {maxFiles} file)
          </p>
        </div>
      </div>

      {/* File Preview Area */}
      {(files.length > 0 || existingFiles.length > 0) && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {existingFiles.map((file, index) => (
            <div key={`existing-${index}`} className="relative border rounded p-1">
              {file.url.endsWith(".pdf") ? (
                <div className="h-24 w-full flex items-center justify-center bg-neutral-100 rounded">
                  <span className="text-sm text-neutral-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {file.name}
                  </span>
                </div>
              ) : (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-24 w-full object-cover rounded"
                />
              )}
            </div>
          ))}
          
          {files.map((file, index) => (
            <div key={index} className="relative border rounded p-1">
              {file.type.includes("pdf") ? (
                <div className="h-24 w-full flex items-center justify-center bg-neutral-100 rounded">
                  <span className="text-sm text-neutral-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    {file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name}
                  </span>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-24 w-full object-cover rounded"
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm text-neutral-400 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
