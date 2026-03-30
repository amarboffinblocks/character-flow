"use client";

import { cn } from "@/lib/utils";
import { useField } from "formik";
import { CloudUpload } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface FormImageUploadProps {
    name: string;
    label?: string;
    acceptedFormats?: string;
    className?: string;
    rules?: {
        accept?: string[];
    };
}

const FormImageUpload: React.FC<FormImageUploadProps> = ({
    name,
    label,
    className,
    rules,
}) => {
    const [field, meta, helpers] = useField<File | string | { url?: string } | null>(name);
    const { setValue, setTouched } = helpers;
    const { value } = field;

    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (value) {
            if (typeof value === "string") {
                setPreview(value);
            } else if (typeof value === "object" && value !== null && "url" in value && typeof value.url === "string") {
                setPreview(value.url);
            } else if (value instanceof File) {
                const previewUrl = URL.createObjectURL(value);
                setPreview(previewUrl);
            }
        } else {
            setPreview(null);
        }
    }, [value]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const allowedExtensions = (rules?.accept || ["png", "jpg", "jpeg"]).map(ext =>
        ext.toLowerCase().replace(".", "")
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            setValue(file);

            setTimeout(() => {
                setTouched(true, true);
            }, 0);

        } else {
            setPreview(null);
            setValue(null);
            setTouched(true, true);
        }
    };
    return (
        <div className="text-center space-y-2">
            <label
                className={cn(
                    "group cursor-pointer relative rounded-full w-30 h-30 overflow-hidden flex flex-col items-center justify-center border border-border bg-surface-subtle p-2 transition-colors hover:bg-surface-hover hover:border-border focus-within:ring-2 focus-within:ring-focus-ring focus-within:border-focus-ring",
                    meta.touched && meta.error && "border-destructive ring-2 ring-destructive focus-within:ring-destructive",
                    className
                )}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-full"
                        />
                    </div>
                ) : (
                    <CloudUpload
                        className={cn(
                            "size-12 text-muted-foreground transition-colors group-hover:text-foreground",
                            meta.touched && meta.error && "text-destructive group-hover:text-destructive"
                        )}
                    />
                )}
                <input
                    type="file"
                    accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
                    onChange={handleFileChange}
                    className="hidden"

                />
            </label>
            {label && (
                <p className="text-sm font-medium text-center pr-2 text-muted-foreground">
                    {label}
                </p>
            )}
            {meta.touched && meta.error && (
                <p className="text-sm text-destructive">{meta.error}</p>
            )}
        </div>
    );
};

export default FormImageUpload;