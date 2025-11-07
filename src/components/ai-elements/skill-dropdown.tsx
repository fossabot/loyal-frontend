"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { LoyalSkill } from "@/types/skills";

type SkillDropdownProps = {
  skills: LoyalSkill[];
  selectedIndex: number;
  onSelect: (skill: LoyalSkill) => void;
  position?: { top: number; left: number };
  style?: CSSProperties;
};

export const SkillDropdown = ({
  skills,
  selectedIndex,
  onSelect,
  position,
  style,
}: SkillDropdownProps) => {
  if (!skills.length) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto"
      style={{
        position: "absolute",
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        zIndex: 20,
        ...style,
      }}
    >
      <div
        className={cn(
          "min-w-[12rem] rounded-2xl border border-white/10 bg-white/10 p-1 text-sm text-white shadow-2xl",
          "backdrop-blur-xl"
        )}
      >
        {skills.map((skill, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={skill.id}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10"
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(skill);
              }}
              type="button"
            >
              <span className="font-medium">{skill.label}</span>
              {skill.description && (
                <span className="text-xs text-white/60">
                  {skill.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
