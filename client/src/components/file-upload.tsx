import React, { useState } from "react";
import { FileInput } from "@/components/ui/file-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface FileUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  required?: boolean;
}

export function FileUpload({
  control,
  name,
  label,
  description,
  maxFiles = 5,
  maxSize = 10,
  accept = "image/*, application/pdf",
  required = false,
}: FileUploadProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <FileInput
              id={name}
              accept={accept}
              maxFiles={maxFiles}
              maxSize={maxSize}
              onFilesChange={(files) => field.onChange(files)}
              error={fieldState.error?.message}
            />
          </FormControl>
          {description && <p className="text-xs text-neutral-dark mt-1">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
