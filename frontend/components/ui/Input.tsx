import { type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className={cn("mb-1.5 block text-sm font-medium text-ink-900", props.className)} />
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <div>
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
        "focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
        error ? "border-red-400" : "border-gray-300",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <div>
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
        "focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
        error ? "border-red-400" : "border-gray-300",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
