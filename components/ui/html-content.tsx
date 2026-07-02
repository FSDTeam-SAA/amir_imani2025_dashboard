"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HtmlContentProps {
  html: string;
  className?: string;
  /**
   * If true, strips all HTML tags and returns plain text.
   * Useful for previews/excerpts where you just want text content.
   */
  asPlainText?: boolean;
  /**
   * Maximum number of characters to show (only applies when asPlainText is true)
   */
  maxLength?: number;
}

/**
 * Component to safely render HTML content from rich text editors.
 * Use this for displaying blog descriptions, product descriptions, etc.
 * outside of forms.
 *
 * @example
 * // Render full HTML
 * <HtmlContent html={blog.description} />
 *
 * // Render as plain text excerpt
 * <HtmlContent html={blog.description} asPlainText maxLength={150} />
 */
export function HtmlContent({
  html,
  className,
  asPlainText = false,
  maxLength,
}: HtmlContentProps) {
  if (!html) {
    return null;
  }

  if (asPlainText) {
    // Strip HTML tags to get plain text
    const plainText = html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();

    const displayText =
      maxLength && plainText.length > maxLength
        ? `${plainText.substring(0, maxLength)}...`
        : plainText;

    return <span className={className}>{displayText}</span>;
  }

  // Render HTML content safely using dangerouslySetInnerHTML
  // Note: This assumes the HTML content is from a trusted source (your own rich text editor)
  return (
    <div
      className={cn(
        // Base prose styles for rendered HTML content
        "prose prose-sm max-w-none",
        // Customize prose elements for better integration
        "prose-p:my-1 prose-p:leading-relaxed",
        "prose-headings:my-2 prose-headings:font-heading",
        "prose-ul:my-1 prose-ol:my-1",
        "prose-li:my-0.5",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-strong:font-semibold",
        "prose-img:rounded-md prose-img:my-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default HtmlContent;
