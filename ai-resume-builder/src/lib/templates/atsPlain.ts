import type {
  Resume,
  WorkExperienceItem,
  EducationItem,
  ProjectItem,
  SkillCategory,
  CertificationItem,
  PublicationItem,
  AwardItem,
  LanguageItem,
} from "../types/resume";

const renderHeadingLine = (text: string): string => `${text.toUpperCase()}\n`;

const renderContact = (resume: Resume): string => {
  const parts: string[] = [resume.contact.fullName];
  if (resume.contact.location) parts.push(resume.contact.location);
  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.github) contactParts.push(resume.contact.github);
  if (resume.contact.website) contactParts.push(resume.contact.website);
  if (contactParts.length) parts.push(contactParts.join(" | "));
  return parts.join("\n") + "\n\n";
};

const renderSummary = (summary?: string): string => {
  if (!summary) return "";
  return renderHeadingLine("Summary") + summary + "\n\n";
};

const renderBullets = (bullets: string[]): string => {
  return bullets.map((b) => `- ${b}`).join("\n") + "\n";
};

const renderWork = (items: WorkExperienceItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Experience");
  for (const item of items) {
    const line1: string[] = [item.role, "|", item.company];
    if (item.location) line1.push("|", item.location);
    out += line1.join(" ") + "\n";
    const dates = [item.startDate, item.endDate ?? "Present"].join(" – ");
    out += dates + "\n";
    out += renderBullets(item.achievements);
    if (item.technologies?.length) {
      out += `Technologies: ${item.technologies.join(", ")}\n`;
    }
    out += "\n";
  }
  return out;
};

const renderEducation = (items: EducationItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Education");
  for (const item of items) {
    const line1: string[] = [item.degree];
    if (item.field) line1.push(item.field);
    out += [line1.join(", "), item.institution].filter(Boolean).join(" | ") + "\n";
    const details: string[] = [];
    if (item.location) details.push(item.location);
    if (item.graduationDate) details.push(`Graduated ${item.graduationDate}`);
    if (item.gpa) details.push(`GPA ${item.gpa}`);
    if (details.length) out += details.join(" | ") + "\n";
    out += "\n";
  }
  return out;
};

const renderProjects = (items: ProjectItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Projects");
  for (const item of items) {
    out += item.name + (item.link ? ` | ${item.link}` : "") + "\n";
    out += (item.description ?? "");
    if (item.impact) out += ` (${item.impact})`;
    out += "\n";
    if (item.technologies?.length) out += `Tech: ${item.technologies.join(", ")}\n`;
    out += "\n";
  }
  return out;
};

const renderSkills = (items: SkillCategory[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Skills");
  for (const cat of items) {
    out += `${cat.category}: ${cat.skills.join(", ")}\n`;
  }
  out += "\n";
  return out;
};

const renderCerts = (items: CertificationItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Certifications");
  for (const c of items) {
    const line = [c.name, c.issuer, c.date].filter(Boolean).join(" | ");
    out += line + (c.url ? ` | ${c.url}` : "") + "\n";
  }
  out += "\n";
  return out;
};

const renderPublications = (items: PublicationItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Publications");
  for (const p of items) {
    const line = [p.title, p.outlet, p.date].filter(Boolean).join(" | ");
    out += line + (p.url ? ` | ${p.url}` : "") + "\n";
  }
  out += "\n";
  return out;
};

const renderAwards = (items: AwardItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Awards");
  for (const a of items) {
    const line = [a.name, a.issuer, a.date].filter(Boolean).join(" | ");
    out += line + (a.description ? ` - ${a.description}` : "") + "\n";
  }
  out += "\n";
  return out;
};

const renderLanguages = (items: LanguageItem[] = []): string => {
  if (!items.length) return "";
  let out = renderHeadingLine("Languages");
  for (const l of items) {
    out += `${l.language}${l.proficiency ? ` - ${l.proficiency}` : ""}\n`;
  }
  out += "\n";
  return out;
};

export const renderAtsPlainText = (resume: Resume): string => {
  let out = "";
  out += renderContact(resume);
  out += renderSummary(resume.summary);
  out += renderWork(resume.work);
  out += renderProjects(resume.projects);
  out += renderSkills(resume.skills);
  out += renderEducation(resume.education);
  out += renderCerts(resume.certifications);
  out += renderPublications(resume.publications);
  out += renderAwards(resume.awards);
  out += renderLanguages(resume.languages);
  if (resume.customSections?.length) {
    for (const section of resume.customSections) {
      out += renderHeadingLine(section.title);
      for (const item of section.items) {
        out += Object.values(item)
          .map((v) => String(v))
          .join(" | ") + "\n";
      }
      out += "\n";
    }
  }
  return out.trim() + "\n";
};

