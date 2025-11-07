"use client";

import type { CSSProperties, TextareaHTMLAttributes } from "react";
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { SkillDropdown } from "@/components/ai-elements/skill-dropdown";
import { SkillHighlightOverlay } from "@/components/skill-highlight-overlay";
import { useSkillInvocation } from "@/hooks/use-skill-invocation";
import type { LoyalSkill } from "@/types/skills";

const SKILL_HORIZONTAL_PADDING_REM = 0.65;
const SKILL_VERTICAL_PADDING_REM = 0.15;

export type SkillsTextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    onSkillSelect?: (skill: LoyalSkill, slashIndex: number) => void;
  };

export const SkillsTextarea = forwardRef<
  HTMLTextAreaElement,
  SkillsTextareaProps
>(({ onKeyDown, onInput, onChange, value, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const [typographyStyles, setTypographyStyles] = useState<
    Pick<
      CSSProperties,
      "fontFamily" | "fontSize" | "fontWeight" | "letterSpacing" | "lineHeight"
    >
  >(() => ({
    fontFamily: props.style?.fontFamily ?? "inherit",
    fontSize: props.style?.fontSize ?? "1rem",
    fontWeight: props.style?.fontWeight,
    letterSpacing: props.style?.letterSpacing,
    lineHeight: props.style?.lineHeight ?? "1.5",
  }));

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const {
    isDropdownOpen,
    dropdownPosition,
    selectedSkillIndex,
    filteredSkills,
    skillSegments,
    handleKeyDown: handleSkillKeyDown,
    handleInput: handleSkillInput,
    selectSkill,
  } = useSkillInvocation({
    textareaRef: internalRef,
    onChange,
    currentValue: value as string | undefined,
  });

  const handleKeyDownCombined = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const handledBySkill = handleSkillKeyDown(e);
    if (!handledBySkill && onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleInputCombined = (e: React.FormEvent<HTMLTextAreaElement>) => {
    handleSkillInput(e);
    if (onInput) {
      onInput(e);
    }
  };

  const handleChangeCombined = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const styleDependencies = {
    fontFamily: props.style?.fontFamily,
    fontSize: props.style?.fontSize,
    fontWeight: props.style?.fontWeight,
    letterSpacing: props.style?.letterSpacing,
    lineHeight: props.style?.lineHeight,
  };

  useLayoutEffect(() => {
    const textarea = internalRef.current;
    if (!textarea) {
      return undefined;
    }

    const syncTypography = () => {
      const computed = window.getComputedStyle(textarea);
      setTypographyStyles({
        fontFamily: styleDependencies.fontFamily ?? computed.fontFamily,
        fontSize: styleDependencies.fontSize ?? computed.fontSize,
        fontWeight: styleDependencies.fontWeight ?? computed.fontWeight,
        letterSpacing:
          styleDependencies.letterSpacing ?? computed.letterSpacing,
        lineHeight: styleDependencies.lineHeight ?? computed.lineHeight,
      });
    };

    syncTypography();

    const fontSet = document.fonts;
    const supportsFontEvents = Boolean(fontSet?.addEventListener);
    if (supportsFontEvents) {
      fontSet.addEventListener("loadingdone", syncTypography);
    }

    return () => {
      if (supportsFontEvents) {
        fontSet.removeEventListener("loadingdone", syncTypography);
      }
    };
  }, [
    styleDependencies.fontFamily,
    styleDependencies.fontSize,
    styleDependencies.fontWeight,
    styleDependencies.letterSpacing,
    styleDependencies.lineHeight,
  ]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        flex: 1,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <SkillHighlightOverlay
        segments={skillSegments}
        style={{
          padding: props.style?.padding || "1.25rem 1.75rem",
          paddingRight: props.style?.paddingRight || "3.5rem",
          color: props.style?.color || "#fff",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          overflow: "hidden",
          zIndex: 0,
          ...typographyStyles,
        }}
        skillClassName="text-transparent"
        skillStyle={{
          padding: `${SKILL_VERTICAL_PADDING_REM}rem ${SKILL_HORIZONTAL_PADDING_REM}rem`,
          marginLeft: `-${SKILL_HORIZONTAL_PADDING_REM}rem`,
          marginRight: `-${SKILL_HORIZONTAL_PADDING_REM}rem`,
          marginTop: `-${SKILL_VERTICAL_PADDING_REM}rem`,
          marginBottom: `-${SKILL_VERTICAL_PADDING_REM}rem`,
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, rgba(248, 113, 113, 0.25), rgba(239, 68, 68, 0.5))",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow:
            "0 14px 35px rgba(239, 68, 68, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(239, 68, 68, 0.4)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
        textClassName="opacity-0"
      />

      <textarea
        onChange={handleChangeCombined}
        onInput={handleInputCombined}
        onKeyDown={handleKeyDownCombined}
        ref={textareaRef}
        {...props}
        style={{
          ...props.style,
          position: "relative",
          zIndex: 1,
          backgroundColor: props.style?.background || "transparent",
          caretColor: props.style?.color || "#fff",
        }}
      />

      {isDropdownOpen && (
        <SkillDropdown
          onSelect={selectSkill}
          position={dropdownPosition}
          selectedIndex={selectedSkillIndex}
          skills={filteredSkills}
          textareaRef={internalRef}
        />
      )}
    </div>
  );
});

SkillsTextarea.displayName = "SkillsTextarea";
