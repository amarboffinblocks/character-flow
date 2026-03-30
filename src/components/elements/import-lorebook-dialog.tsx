"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, Loader2, X, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportLorebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (files: File[]) => void;
  isLoading?: boolean;
  isBulk?: boolean;
}

const ALLOWED_TYPES = ["application/json"];
const ACCEPT_STRING = ".json";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ImportLorebookDialog: React.FC<ImportLorebookDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  isLoading = false,
  isBulk = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (ALLOWED_TYPES.includes(file.type)) {
          newFiles.push(file);
        }
      }

      if (newFiles.length === 0) return;

      if (isBulk) {
        setSelectedFiles((prev) => [...prev, ...newFiles]);
      } else {
        setSelectedFiles([newFiles[0]]);
      }
    },
    [isBulk]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleImport = useCallback(() => {
    if (selectedFiles.length > 0) {
      onImport(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedFiles, onImport]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  }, [isLoading, onOpenChange]);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-4xl p-0 gap-0 overflow-hidden border-primary/30 bg-primary/15 backdrop-blur-3xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 text-left space-y-1.5 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/25 border border-primary/40">
              <Upload className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                {isBulk ? "Bulk Import Lorebooks" : "Import Lorebook"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {isBulk
                  ? "Import multiple lorebooks from JSON files"
                  : "Add a lorebook from a JSON file"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Supported formats */}
        <div className="px-6 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground/80">Supported:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-white/80">
            <FileJson className="size-3.5 text-primary" />
            JSON
          </span>
        </div>

        {/* Drop zone */}
        <div className="px-6 pb-6 min-w-0 overflow-x-hidden">
          <div
            className={cn(
              "relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden",
              "cursor-pointer",
              dragActive && "border-primary bg-primary/15 scale-[1.005]",
              selectedFiles.length > 0
                ? "border-primary/40 bg-primary/5"
                : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => selectedFiles.length === 0 && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
              multiple={isBulk}
            />

            {selectedFiles.length > 0 ? (
              <div className="p-5 space-y-4 min-w-0 overflow-hidden">
                <div className="max-h-[200px] overflow-y-auto overflow-x-hidden space-y-2 pr-1 min-w-0">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 min-w-0 overflow-hidden"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <FileJson className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="font-medium text-sm text-white truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-white rounded-full opacity-70 hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-primary/20 min-w-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="size-3.5" />
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                    </span>
                    <span>{formatFileSize(totalSize)} total</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                      disabled={isLoading}
                    >
                      Add more
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAll();
                      }}
                      className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isLoading}
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Upload className="size-8 text-primary/80" />
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  Drop your file{isBulk ? "s" : ""} here or{" "}
                  <span className="text-primary font-medium">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {isBulk ? "JSON files with lorebook data" : "JSON lorebook file"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading}
                  className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                >
                  Select file{isBulk ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-primary/5 border-t border-primary/20 gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isLoading}
            className="rounded-full bg-primary hover:bg-accent-hover text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                {isBulk ? "Import Lorebooks" : "Import Lorebook"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLorebookDialog;
