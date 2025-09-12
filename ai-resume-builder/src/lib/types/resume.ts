export type ContactInfo = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

export type ResumeSection = {
  id: string;
  title: string;
  items: Array<Record<string, unknown>>;
};

export type WorkExperienceItem = {
  company: string;
  role: string;
  location?: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or 'Present'
  achievements: string[]; // bullet points, ATS-safe
  technologies?: string[];
};

export type EducationItem = {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate?: string; // YYYY or YYYY-MM
  gpa?: string;
};

export type ProjectItem = {
  name: string;
  description: string;
  impact?: string;
  technologies?: string[];
  link?: string;
};

export type SkillCategory = {
  category: string;
  skills: string[];
};

export type CertificationItem = {
  name: string;
  issuer?: string;
  date?: string; // YYYY or YYYY-MM
  credentialId?: string;
  url?: string;
};

export type PublicationItem = {
  title: string;
  outlet?: string;
  date?: string;
  url?: string;
};

export type AwardItem = {
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
};

export type LanguageItem = {
  language: string;
  proficiency?: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
};

export type Resume = {
  contact: ContactInfo;
  summary?: string;
  work?: WorkExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  skills?: SkillCategory[];
  certifications?: CertificationItem[];
  publications?: PublicationItem[];
  awards?: AwardItem[];
  languages?: LanguageItem[];
  customSections?: ResumeSection[];
};

export type TargetJob = {
  title: string;
  description?: string;
  keywords?: string[];
};

export type AtsIssues = {
  missingKeywords: string[];
  riskyFormatting: string[];
  longBullets: number;
  passiveVoiceBullets: number;
  inconsistentDates: number;
};

export type AtsAnalysis = {
  score: number; // 0-100
  issues: AtsIssues;
  notes?: string[];
};

