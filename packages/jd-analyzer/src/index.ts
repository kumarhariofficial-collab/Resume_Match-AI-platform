import {
  JobProfile,
  JobRequirement,
  RequirementCategory,
  PriorityLevel,
} from "@resumematch/core-types";

// Common technical skills dictionary for deterministic identification
const KNOWN_TECH_SKILLS = [
  "SQL", "Python", "Power BI", "Tableau", "AWS", "Databricks", "PySpark",
  "Snowflake", "AWS Glue", "ETL", "Spark", "Hadoop", "Excel", "R", "Java",
  "Scala", "C++", "C#", "JavaScript", "TypeScript", "React", "Node.js",
  "Docker", "Kubernetes", "Git", "Jira", "Confluence", "PostgreSQL",
  "MySQL", "MongoDB", "Redis", "Kafka", "Airflow", "dbt", "Looker",
  "Data Analysis", "KPI Reporting", "Machine Learning", "Deep Learning",
  "Data Engineering", "Data Modeling", "Business Intelligence", "DAX", "Power Query"
];

const SOFT_SKILLS = [
  "Stakeholder Management", "Communication", "Leadership", "Problem Solving",
  "Teamwork", "Agile", "Scrum", "Critical Thinking", "Project Management",
  "Time Management", "Collaboration", "Analytical Skills"
];

export function analyzeJobDescription(rawJD: string): JobProfile {
  const lines = rawJD.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let title = "Target Role";
  let company = "Target Company";
  let experienceLevel = "Mid-Senior";

  // Title extraction heuristic
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 60 && !firstLine.toLowerCase().includes("about us")) {
      title = firstLine;
    }
  }

  // Look for title/company lines
  for (const line of lines.slice(0, 5)) {
    if (line.toLowerCase().includes("job title:") || line.toLowerCase().includes("role:")) {
      title = line.replace(/job title:|role:/i, "").trim();
    }
    if (line.toLowerCase().includes("company:")) {
      company = line.replace(/company:/i, "").trim();
    }
  }

  const requirements: JobRequirement[] = [];
  let reqCounter = 1;

  // 1. Technical Skills Extraction
  for (const skill of KNOWN_TECH_SKILLS) {
    const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i");
    const matches = rawJD.match(new RegExp(regex, "gi"));
    if (matches && matches.length > 0) {
      const isMustHave = isSkillMustHave(rawJD, skill);
      requirements.push({
        id: `req-${reqCounter++}`,
        category: isMustHave ? "MUST_HAVE_SKILL" : "PREFERRED_SKILL",
        priority: isMustHave ? "CRITICAL" : "MEDIUM",
        frequency: matches.length,
        exactPhrase: skill,
        normalizedTerm: normalizeTerm(skill),
        description: `Experience with ${skill} required for role.`,
      });
    }
  }

  // 2. Soft Skills Extraction
  for (const softSkill of SOFT_SKILLS) {
    const regex = new RegExp(`\\b${escapeRegExp(softSkill)}\\b`, "i");
    if (regex.test(rawJD)) {
      requirements.push({
        id: `req-${reqCounter++}`,
        category: "SOFT_SKILL",
        priority: "LOW",
        frequency: 1,
        exactPhrase: softSkill,
        normalizedTerm: normalizeTerm(softSkill),
      });
    }
  }

  // 3. Experience Years Extraction
  const expMatch = rawJD.match(/(\d+)\+?\s*years(?:\s+of)?\s+(?:experience|work|data)/i);
  if (expMatch) {
    const years = parseInt(expMatch[1], 10);
    experienceLevel = `${years}+ Years`;
    requirements.push({
      id: `req-${reqCounter++}`,
      category: "EXPERIENCE",
      priority: "CRITICAL",
      frequency: 1,
      exactPhrase: expMatch[0],
      normalizedTerm: "years_experience",
      minYears: years,
      description: `Minimum ${years} years relevant experience required.`,
    });
  }

  // 4. Education Requirements Extraction
  if (/bachelor'?s|master'?s|phd|degree/i.test(rawJD)) {
    const degreeMatch = rawJD.match(/(bachelor'?s|master'?s|phd)\s+(degree|in\s+[a-z\s]+)?/i);
    requirements.push({
      id: `req-${reqCounter++}`,
      category: "EDUCATION",
      priority: "HIGH",
      frequency: 1,
      exactPhrase: degreeMatch ? degreeMatch[0] : "Bachelor's Degree",
      normalizedTerm: "degree_requirement",
      description: "University degree required.",
    });
  }

  // 5. Responsibilities Extraction from bullet points under Responsibilities section
  let inRespSection = false;
  for (const line of lines) {
    if (/^(responsibilities|what you'?ll do|duties|key responsibilities)/i.test(line)) {
      inRespSection = true;
      continue;
    }
    if (inRespSection && /^(requirements|qualifications|what you bring|skills)/i.test(line)) {
      inRespSection = false;
    }

    if (inRespSection && /^[•\-*▪]\s*/.test(line)) {
      const cleanResp = line.replace(/^[•\-*▪]\s*/, "").trim();
      if (cleanResp.length > 10) {
        requirements.push({
          id: `req-${reqCounter++}`,
          category: "RESPONSIBILITY",
          priority: "HIGH",
          frequency: 1,
          exactPhrase: cleanResp,
          normalizedTerm: normalizeTerm(cleanResp),
          description: cleanResp,
        });
      }
    }
  }

  return {
    title,
    company,
    location: "Not specified",
    experienceLevel,
    employmentType: "Full-Time",
    workArrangement: "Hybrid/Remote",
    requirements,
    rawDescription: rawJD,
  };
}

function isSkillMustHave(jdText: string, skill: string): boolean {
  const lower = jdText.toLowerCase();
  const skillLower = skill.toLowerCase();
  
  // If explicitly under "Requirements" or "Must have" section
  const reqIdx = lower.indexOf("requirement");
  const prefIdx = lower.indexOf("preferred") > -1 ? lower.indexOf("preferred") : lower.indexOf("nice to have");
  const skillIdx = lower.indexOf(skillLower);

  if (skillIdx > -1 && reqIdx > -1 && skillIdx > reqIdx && (prefIdx === -1 || skillIdx < prefIdx)) {
    return true;
  }
  return lower.includes(`must have ${skillLower}`) || lower.includes(`required: ${skillLower}`);
}

function normalizeTerm(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
