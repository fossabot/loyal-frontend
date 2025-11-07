import type { LoyalSkill } from "@/types/skills";
import { AVAILABLE_SKILLS } from "@/types/skills";

export const SKILL_PREFIX = "\u2063"; // Invisible Separator
export const SKILL_SUFFIX = "\u2064"; // Invisible Plus
export const SKILL_TRAILING_SPACE = "\u2009 \u2009 \u2009 \u2009 "; // Thin space + regular space to keep padding

export type SkillTextSegment = {
  text: string;
  isSkill: boolean;
  skill?: LoyalSkill;
};

const findSkillByLabel = (label: string): LoyalSkill | undefined =>
  AVAILABLE_SKILLS.find(
    (skill) => skill.label.toLowerCase() === label.toLowerCase()
  );

export const splitSkillSegments = (value: string): SkillTextSegment[] => {
  if (!value) {
    return [];
  }

  const segments: SkillTextSegment[] = [];
  let buffer = "";
  let insideSkill = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === SKILL_PREFIX) {
      if (insideSkill) {
        buffer += char;
        continue;
      }

      if (buffer) {
        segments.push({ text: buffer, isSkill: false });
        buffer = "";
      }

      insideSkill = true;
      continue;
    }

    if (char === SKILL_SUFFIX) {
      if (!insideSkill) {
        buffer += char;
        continue;
      }

      const skillText = buffer;
      const skill = findSkillByLabel(skillText);

      segments.push({
        text: skillText,
        isSkill: Boolean(skill),
        skill,
      });

      buffer = "";
      insideSkill = false;
      continue;
    }

    buffer += char;
  }

  if (buffer) {
    segments.push({
      text: insideSkill ? `${SKILL_PREFIX}${buffer}` : buffer,
      isSkill: false,
    });
  }

  return segments;
};

export const stripSkillMarkers = (value: string): string =>
  value
    .replaceAll(SKILL_PREFIX, "")
    .replaceAll(SKILL_SUFFIX, "")
    .replaceAll(SKILL_TRAILING_SPACE, " ");
