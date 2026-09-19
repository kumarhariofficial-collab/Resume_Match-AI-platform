import { describe, it, expect } from "vitest";
import { parseResumeText } from "../index.js";

describe("Resume Parser", () => {
  it("parses contact info and sections correctly from text fixture", () => {
    const fixtureText = `
Jane Doe
jane.doe@example.com | (555) 019-2834 | San Francisco, CA
linkedin.com/in/janedoe | janedoe.dev

SUMMARY
Results-driven Senior Data Analyst with 6+ years of experience in SQL, Python, and Power BI.

TECHNICAL SKILLS
SQL, Python, Power BI, Tableau, Snowflake, ETL, AWS Glue, PySpark

WORK EXPERIENCE
Tech Solutions Inc. | Senior Data Analyst
Mar 2021 - Present
- Automated weekly KPI reporting using SQL and Power BI, reducing manual reporting effort by 40%.
- Designed and built scalable ETL data pipelines in AWS Glue processing 2TB daily data.

Data Corp | Data Analyst
Jan 2018 - Feb 2021
- Developed interactive executive dashboards in Tableau for stakeholder management.

EDUCATION
University of California, Berkeley - B.S. Computer Science (2017)

CERTIFICATIONS
AWS Certified Data Analytics - Specialty
`;

    const profile = parseResumeText(fixtureText);

    expect(profile.candidate.name).toBe("Jane Doe");
    expect(profile.candidate.email).toBe("jane.doe@example.com");
    expect(profile.candidate.phone).toBe("(555) 019-2834");
    expect(profile.candidate.linkedin).toContain("linkedin.com/in/janedoe");

    expect(profile.summary).toContain("Senior Data Analyst");
    expect(profile.skills).toContain("SQL");
    expect(profile.skills).toContain("Python");
    expect(profile.skills).toContain("Power BI");

    expect(profile.experience.length).toBe(2);
    expect(profile.experience[0].company).toContain("Tech Solutions");
    expect(profile.experience[0].bullets.length).toBe(2);
    expect(profile.experience[0].quantifiedBulletsCount).toBe(2);

    expect(profile.certifications).toContain("AWS Certified Data Analytics - Specialty");
  });
});
