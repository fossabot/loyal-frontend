"use client";

import type { CSSProperties } from "react";

import type { SkillTextSegment } from "@/lib/skills-text";
import { cn } from "@/lib/utils";

type SkillHighlightOverlayProps = {
  segments: SkillTextSegment[];
  className?: string;
  style?: CSSProperties;
  skillClassName?: string;
  skillStyle?: CSSProperties;
  textClassName?: string;
  textStyle?: CSSProperties;
};

export const SkillHighlightOverlay = ({
  segments,
  className,
  style,
  skillClassName,
  skillStyle,
  textClassName,
  textStyle,
}: SkillHighlightOverlayProps) => {
  if (!segments.some((segment) => segment.isSkill)) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 whitespace-pre-wrap break-words",
        className
      )}
      style={style}
    >
      {segments.map((segment, index) => {
        const key = `${segment.isSkill ? "skill" : "text"}-${index}`;

        if (segment.isSkill) {
          return (
            <span
              key={key}
              className={cn(
                "inline rounded-full border border-primary/40 bg-primary/15 px-1 text-transparent",
                "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
                skillClassName
              )}
              style={skillStyle}
            >
              {segment.text}
            </span>
          );
        }

        return (
          <span
            key={key}
            className={cn("opacity-0", textClassName)}
            style={textStyle}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
};
