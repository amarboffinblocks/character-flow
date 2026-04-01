"use client";

import React, { useState } from "react";
import { Download, FolderSymlink, Image as ImageIcon, MoreVertical, Trash2, Globe, TriangleAlert } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import type { Background } from "@/lib/api/backgrounds";

interface BackgroundCardProps {
  background: Background;
  selected?: boolean;
  onSelectChange?: (id: string, checked: boolean) => void;
  onSetDefault?: (id: string) => void;
  onClearDefault?: (id: string) => void;
  onDownload?: (id: string, format?: "png" | "jpg") => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({
  background,
  selected = false,
  onSelectChange,
  onSetDefault,
  onClearDefault,
  onDownload,
  onDelete,
  className = "",
  ...props
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const imageUrl = background.image?.url?.trim() || undefined;

  const handleCheckboxChange = (checked: boolean) => {
    onSelectChange?.(background.id, checked);
  };

  const displayName = background.name || "Background";

  return (
    <>
      <div
        {...props}
        className={cn(
          "relative rounded-2xl border overflow-hidden group aspect-video",
          "bg-surface-base border-border",
          "hover:border-focus-ring hover:bg-surface-hover hover:shadow-md",
          "transition-all duration-300 ease-out",
          className
        )}
      >
        {/* Image container */}
        <div className="absolute inset-0">
          {/* Background image */}
          {imageUrl ? (
            <div
              role="img"
              aria-label={displayName}
              className={cn(
                "absolute inset-0 z-0 bg-center bg-cover bg-no-repeat transition-transform duration-500",
                "group-hover:scale-105"
              )}
              style={{ backgroundImage: `url("${imageUrl.replace(/"/g, "%22")}")` }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-surface-active flex items-center justify-center"
              aria-hidden
            >
              <span className="text-2xl font-semibold text-muted-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Gradient overlay for better contrast */}
          <div
            className="absolute inset-0 z-1 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0) 100%)",
            }}
            aria-hidden
          />
        </div>

        {/* Top bar: checkbox, badges, menu */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-start p-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Checkbox
              id={`background-${background.id}`}
              checked={selected}
              onCheckedChange={handleCheckboxChange}
              className="bg-surface-selected border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer data-[state=checked]:text-primary-foreground text-foreground rounded-full size-6"
            />
            {background.isGlobalDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-primary-foreground border border-border">
                <Globe className="size-2.5" />
                Default
              </span>
            )}
            {(background.characterId || background.personaId || background.realmId) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-selected text-foreground border border-border">
                <FolderSymlink className="size-2.5" />
                Linked
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 rounded-full bg-surface-selected hover:bg-surface-hover text-foreground transition-colors"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border min-w-[250px] p-1.5">
              <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">Background Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  background.isGlobalDefault
                    ? onClearDefault?.(background.id)
                    : onSetDefault?.(background.id)
                }
              >
                <Globe className="w-4 h-4 mr-2" />
                {background.isGlobalDefault
                  ? "Remove as Default"
                  : "Set as Default Global Background"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer ">
                  <Download className="w-4 h-4 mr-4  " /> Download
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover border border-border p-1.5">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onDownload?.(background.id, "png")}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onDownload?.(background.id, "jpg")}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> JPG
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom: name overlay on hover */}
        {displayName && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-3 z-10",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}
          >
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-border rounded-3xl p-0 gap-0 overflow-hidden shadow-xl sm:max-w-md">
          <AlertDialogHeader className="px-6 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-surface-active border-2 border-border">
                <TriangleAlert className="size-7 text-warning" aria-hidden />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center leading-tight">
              Delete background?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground text-center">
                <p>
                  {background.name ? (
                    <>
                      <span className="font-semibold text-foreground">&ldquo;{displayName}&rdquo;</span> will be permanently removed from your account.
                    </>
                  ) : (
                    <>This background will be permanently removed from your account.</>
                  )}
                </p>
                <p className="text-xs">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-6 py-4 bg-surface-subtle border-t border-border gap-3 justify-center flex-wrap">
            <AlertDialogCancel className="rounded-full border-border hover:bg-surface-hover hover:border-focus-ring text-foreground flex-1 sm:flex-initial">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete?.(background.id);
                setIsDeleteDialogOpen(false);
              }}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-danger border-0 flex-1 sm:flex-initial"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BackgroundCard;
