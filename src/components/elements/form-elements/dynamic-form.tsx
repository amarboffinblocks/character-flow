/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Loader2 } from "lucide-react";

import { FormData } from "@/types/form-types";
import { buildZodSchema, buildInitialValues } from "@/utils/build-zod-schema";
import { calculateTotalTokens } from "@/lib/utils/token-utils";

import { Button } from "@/components/ui/button";
import FormFields from "./fields";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                               Token Counter                                */
/* -------------------------------------------------------------------------- */

const TotalTokenCounter = ({ schema }: { schema: FormData[] }) => {
  const { values } = useFormikContext<Record<string, any>>();

  const tokenSchema = useMemo(
    () => schema.filter(f => f.tokens && f.type !== "file"),
    [schema]
  );

  if (tokenSchema.length === 0) return null;

  const totalTokens = useMemo(
    () => calculateTotalTokens(values, tokenSchema),
    [values, tokenSchema]
  );

  return (
    <div className="rounded-xl flex flex-col justify-center h-full">
      <div className="text-xl font-semibold text-right text-foreground flex items-baseline justify-end gap-1">
        {totalTokens}
        <span className="text-sm font-medium text-muted-foreground">Tokens used</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Dynamic Form                                */
/* -------------------------------------------------------------------------- */

interface DynamicFormProps {
  schema: FormData[];
  initialValues?: Record<string, any>;
  onSubmit: (values: any) => void;
  children?: React.ReactNode;
  button?: boolean;
  submitButtonText?: string;
  isSubmitting?: boolean;
  submitButtonDisabled?: boolean;
  formKey?: string;
  formRef?: React.MutableRefObject<any>;
  footerChildren?: React.ReactNode;
  invalidSubmitToastMessage?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  initialValues,
  onSubmit,
  children,
  button = true,
  submitButtonText = "Save",
  isSubmitting = false,
  submitButtonDisabled = false,
  formKey,
  formRef,
  footerChildren,
  invalidSubmitToastMessage,
}) => {
  const validationSchema = buildZodSchema(schema);
  const defaultValues = buildInitialValues(schema);

  const mergedInitialValues = useMemo(
    () => ({ ...defaultValues, ...(initialValues || {}) }),
    [defaultValues, initialValues]
  );

  const fileFields = useMemo(
    () => schema.filter(field => field.type === "file"),
    [schema]
  );

  const otherFields = useMemo(
    () => schema.filter(field => field.type !== "file"),
    [schema]
  );

  const tokenSchema = useMemo(
    () => schema.filter(f => f.tokens && f.type !== "file"),
    [schema]
  );

  return (
    <Formik
      key={formKey}
      initialValues={mergedInitialValues}
      validationSchema={toFormikValidationSchema(validationSchema as unknown as Parameters<typeof toFormikValidationSchema>[0])}
      enableReinitialize
      validateOnChange
      validateOnBlur
      onSubmit={(values) => {
        const totalTokens = calculateTotalTokens(values, tokenSchema);

        onSubmit({
          ...values,
          total_tokens: totalTokens,
        });
      }}
      innerRef={(formik) => {
        if (formRef && formik) {
          formRef.current = {
            resetForm: () =>
              formik.resetForm({ values: mergedInitialValues }),
          };
        }
      }}
    >
      {({ handleSubmit, validateForm, submitForm, setTouched }) => (
        <Form
          className="grid grid-cols-12 gap-3"
          noValidate
          onSubmit={handleSubmit}
        >
          {/* ----------------------------- File Fields ----------------------------- */}
          {fileFields.length > 0 && (
            <div className="col-span-2 flex flex-col gap-y-3">
              {fileFields.map((field, index) => (
                <FormFields key={index} {...field} cols={12} />
              ))}
            </div>
          )}

          {/* --------------------------- Other Fields --------------------------- */}
          <div
            className={cn(
              "grid grid-cols-12 gap-4",
              fileFields.length === 0 ? "col-span-12" : "col-span-10"
            )}
          >
            {otherFields.map((field, index) =>
              index === 0 ? (
                <div key={index} className="col-span-12 flex gap-x-3">
                  <div className="flex-1">
                    <FormFields {...field} />
                  </div>
                  {children && <div className="pt-5.5">{children}</div>}
                </div>
              ) : (
                <FormFields key={index} {...field} />
              )
            )}
          </div>

          {/* ---------------------------- Submit Row ---------------------------- */}
          {button && (
            <div className="col-span-12 flex justify-end items-center gap-3 pt-2">
              {tokenSchema.length > 0 && (
                <div className="flex-1">
                  <TotalTokenCounter schema={schema} />
                </div>
              )}

              <div className="shrink-0">
                <Button
                  type="button"
                  disabled={isSubmitting || submitButtonDisabled}
                  onClick={async () => {
                    const errors = await validateForm();
                    if (Object.keys(errors).length > 0) {
                      // Mark all fields touched so field-level errors are shown too
                      setTouched(
                        schema.reduce<Record<string, boolean>>((acc, field) => {
                          acc[field.name] = true;
                          return acc;
                        }, {}),
                        true
                      );
                      if (invalidSubmitToastMessage) {
                        toast.error(invalidSubmitToastMessage);
                      }
                      return;
                    }
                    await submitForm();
                  }}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitButtonText}
                </Button>
              </div>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default DynamicForm;
