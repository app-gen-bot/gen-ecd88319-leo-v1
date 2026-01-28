import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface CodeBlockProps {
  title: string;
  code: string;
  description?: string;
  className?: string;
}

/**
 * CodeBlock - Reusable code display component with copy functionality
 *
 * Displays code in a styled pre/code block with a copy button.
 * Shows a checkmark briefly after successful copy.
 */
export function CodeBlock({
  title,
  code,
  description,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{title}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="relative">
        <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
          <code className="font-mono">{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2"
          onClick={copyToClipboard}
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
