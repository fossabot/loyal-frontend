export type LoyalSkill = {
  id: string;
  label: string;
  description?: string;
};

export type SkillInvocation = {
  skill: LoyalSkill;
  startIndex: number;
  endIndex: number;
};

export const AVAILABLE_SKILLS: LoyalSkill[] = [
  {
    id: "send",
    label: "Send",
    description: "Send assets on blockchain",
  },
];
