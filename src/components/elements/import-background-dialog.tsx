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
import { Upload, ImageIcon, Loader2, X, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPT_STRING = ".jpg,.jpeg,.png,.webp,.gif";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface ImportBackgroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (files: File[]) => void;
  isLoading?: boolean;
  isBulk?: boolean;
}

const ImportBackgroundDialog: React.FC<ImportBackgroundDialogProps> = ({
  open,
  onOpenChange,
  onImport,
  isLoading = false,
  isBulk = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [invalidSelection, setInvalidSelection] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newFiles: File[] = [];
      let invalidCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
          newFiles.push(file);
        } else {
          invalidCount += 1;
        }
      }

      setInvalidSelection(invalidCount > 0);
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
      setInvalidSelection(false);
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
    setInvalidSelection(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] rounded-3xl p-0 gap-0 overflow-hidden overflow-x-hidden border-border bg-popover">
        <DialogHeader className="px-6 pt-6 pb-5 text-left space-y-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-subtle">
              <Upload className="size-5 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isBulk ? "Bulk Import Backgrounds" : "Import Background"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {isBulk
                  ? "Import multiple background images from JPEG, PNG, WebP or GIF files"
                  : "Add a background image from JPEG, PNG, WebP or GIF"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          {invalidSelection && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-destructive bg-surface-subtle p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-xs text-muted-foreground">
                Some files were skipped because only JPEG, PNG, WebP, and GIF are supported.
              </p>
            </div>
          )}

          <div
            className={cn(
              "relative rounded-2xl border border-dashed bg-surface-base transition-colors duration-200 overflow-hidden cursor-pointer",
              dragActive && "border-focus-ring bg-surface-hover",
              !dragActive && selectedFiles.length === 0 && "hover:border-focus-ring hover:bg-surface-hover",
              selectedFiles.length > 0 && "border-border bg-surface-subtle"
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
              <div className="p-4 space-y-4 min-w-0 overflow-hidden">
                <div className="max-h-[220px] overflow-y-auto overflow-x-hidden space-y-2 pr-1 min-w-0 w-full">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className=" w-full min-w-0 flex  items-start gap-3 overflow-hidden rounded-xl border border-border bg-surface-base px-4 py-3"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle">
                        <ImageIcon className="size-4 text-foreground" />
                      </div>
                      <div className="min-w-0 max-w-full overflow-hidden">
                        <p className=" overflow-hidden max-w-xs text-ellipsis whitespace-nowrap font-medium text-sm text-foreground " title={file.name}>
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border min-w-0">
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
                      className="rounded-full"
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
                      className="rounded-full text-destructive hover:text-destructive"
                      disabled={isLoading}
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-surface-subtle">
                  {dragActive ? (
                    <FileCheck className="size-7 text-foreground" />
                  ) : (
                    <Upload className="size-7 text-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {dragActive
                    ? `Drop to add your image${isBulk ? "s" : ""}`
                    : `Drop your image${isBulk ? "s" : ""} here or browse`}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {isBulk
                    ? "JPEG, PNG, WebP, or GIF images"
                    : "JPEG, PNG, WebP, or GIF image"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading}
                  className="rounded-full"
                >
                  Select file{isBulk ? "s" : ""}
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 py-4  gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isLoading}
            className="rounded-full"
            variant={"default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                {isBulk ? "Import Backgrounds" : "Import Background"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportBackgroundDialog;
