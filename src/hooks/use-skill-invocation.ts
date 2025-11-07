"use client";

import { useCallback, useEffect, useState } from "react";

import {
  SKILL_PREFIX,
  SKILL_SUFFIX,
  SKILL_TRAILING_SPACE,
  splitSkillSegments,
} from "@/lib/skills-text";
import type { SkillTextSegment } from "@/lib/skills-text";
import type { LoyalSkill } from "@/types/skills";
import { AVAILABLE_SKILLS } from "@/types/skills";

type UseSkillInvocationProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSkillSelect?: (skill: LoyalSkill, slashIndex: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  currentValue?: string;
};

type UseSkillInvocationReturn = {
  isDropdownOpen: boolean;
  dropdownPosition: { top: number; left: number };
  selectedSkillIndex: number;
  filteredSkills: LoyalSkill[];
  slashIndex: number | null;
  skillSegments: SkillTextSegment[];
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
  handleInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  selectSkill: (skill: LoyalSkill) => void;
};

export const useSkillInvocation = ({
  textareaRef,
  onSkillSelect,
  onChange,
  currentValue,
}: UseSkillInvocationProps): UseSkillInvocationReturn => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
  const [filteredSkills, setFilteredSkills] = useState<LoyalSkill[]>([]);
  const [slashIndex, setSlashIndex] = useState<number | null>(null);
  const [skillSegments, setSkillSegments] = useState<SkillTextSegment[]>([]);

  const applyTextMutation = useCallback(
    (newValue: string, caretPosition: number) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.value = newValue;
      textarea.selectionStart = caretPosition;
      textarea.selectionEnd = caretPosition;

      if (onChange) {
        const event = {
          target: textarea,
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
      }

      setSkillSegments(splitSkillSegments(newValue));
    },
    [onChange, textareaRef]
  );

  const getSkillRangeAtIndex = useCallback(
    (
      text: string,
      index: number
    ): { start: number; end: number } | null => {
      if (index < 0 || index > text.length) {
        return null;
      }

      const prefixIndex = text.lastIndexOf(SKILL_PREFIX, index);
      if (prefixIndex === -1) {
        return null;
      }

      const suffixIndex = text.indexOf(SKILL_SUFFIX, prefixIndex + 1);
      if (suffixIndex === -1 || index < prefixIndex) {
        return null;
      }

      let trailingLength = 0;
      for (let offset = 0; offset < SKILL_TRAILING_SPACE.length; offset += 1) {
        const trailingChar = text[suffixIndex + 1 + offset];
        if (trailingChar === SKILL_TRAILING_SPACE[offset]) {
          trailingLength += 1;
        } else {
          break;
        }
      }

      const tokenEnd = suffixIndex + 1 + trailingLength;

      if (index <= tokenEnd) {
        return { start: prefixIndex, end: tokenEnd };
      }

      return null;
    },
    []
  );

  const removeSkillAtIndex = useCallback(
    (index: number): boolean => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return false;
      }

      const { value } = textarea;
      const range = getSkillRangeAtIndex(value, index);
      if (!range) {
        return false;
      }

      const newValue = value.slice(0, range.start) + value.slice(range.end);
      applyTextMutation(newValue, range.start);
      return true;
    },
    [applyTextMutation, getSkillRangeAtIndex, textareaRef]
  );

  const syncSegments = useCallback(() => {
    const text = currentValue ?? textareaRef.current?.value ?? "";
    setSkillSegments(splitSkillSegments(text));
  }, [currentValue, textareaRef]);

  useEffect(() => {
    syncSegments();
  }, [syncSegments]);

  const detectSlash = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);

      if (!textAfterSlash.includes(" ")) {
        const filtered = AVAILABLE_SKILLS.filter((skill) =>
          skill.label.toLowerCase().startsWith(textAfterSlash.toLowerCase())
        );

        if (filtered.length > 0) {
          const lines = textBeforeCursor.split("\n");
          const currentLine = lines.length;
          const lineHeight = 24;
          const charWidth = 8;
          const lastLineLength = lines.at(-1)?.length ?? 0;

          const top = currentLine * lineHeight;
          const left = lastLineLength * charWidth;

          setSlashIndex(lastSlashIndex);
          setFilteredSkills(filtered);
          setDropdownPosition({ top, left });
          setIsDropdownOpen(true);
          setSelectedSkillIndex(0);
          return;
        }
      }
    }

    setIsDropdownOpen(false);
    setSlashIndex(null);
  }, [textareaRef]);

  const selectSkill = useCallback(
    (skill: LoyalSkill) => {
      const textarea = textareaRef.current;
      if (!textarea || slashIndex === null) {
        return;
      }

      const text = textarea.value;
      const cursorPos = textarea.selectionStart;

      const before = text.slice(0, slashIndex);
      const after = text.slice(cursorPos);
      const skillToken = `${SKILL_PREFIX}${skill.label}${SKILL_SUFFIX}${SKILL_TRAILING_SPACE}`;
      const newText = before + skillToken + after;

      setIsDropdownOpen(false);
      setSlashIndex(null);
      onSkillSelect?.(skill, slashIndex);

      const tokenLength = skillToken.length;
      const newCursorPos = slashIndex + tokenLength;

      applyTextMutation(newText, newCursorPos);
    },
    [textareaRef, slashIndex, onSkillSelect, applyTextMutation]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (isDropdownOpen) {
        switch (e.key) {
          case "Tab": {
            e.preventDefault();
            if (filteredSkills.length > 0) {
              selectSkill(filteredSkills[selectedSkillIndex]);
            }
            return true;
          }
          case "Escape": {
            e.preventDefault();
            setIsDropdownOpen(false);
            setSlashIndex(null);
            return true;
          }
          case "ArrowDown": {
            e.preventDefault();
            setSelectedSkillIndex((prev) =>
              prev < filteredSkills.length - 1 ? prev + 1 : prev
            );
            return true;
          }
          case "ArrowUp": {
            e.preventDefault();
            setSelectedSkillIndex((prev) => (prev > 0 ? prev - 1 : prev));
            return true;
          }
          default: {
            break;
          }
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        const textarea = textareaRef.current;
        if (
          textarea &&
          textarea.selectionStart === textarea.selectionEnd
        ) {
          const targetIndex =
            e.key === "Backspace"
              ? textarea.selectionStart - 1
              : textarea.selectionStart;

          const handled = removeSkillAtIndex(targetIndex);
          if (handled) {
            e.preventDefault();
            return true;
          }
        }
      }

      return false;
    },
    [
      isDropdownOpen,
      filteredSkills,
      selectedSkillIndex,
      selectSkill,
      textareaRef,
      removeSkillAtIndex,
    ]
  );

  const handleInput = useCallback(
    (_event: React.FormEvent<HTMLTextAreaElement>) => {
      detectSlash();
      const textarea = textareaRef.current;
      if (textarea) {
        setSkillSegments(splitSkillSegments(textarea.value));
      }
    },
    [detectSlash, textareaRef]
  );

  useEffect(() => {
    detectSlash();
  }, [detectSlash]);

  return {
    isDropdownOpen,
    dropdownPosition,
    selectedSkillIndex,
    filteredSkills,
    slashIndex,
    skillSegments,
    handleKeyDown,
    handleInput,
    selectSkill,
  };
};
