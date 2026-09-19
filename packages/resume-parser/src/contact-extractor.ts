import { CandidateContact } from "@resumematch/core-types";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_REGEX = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;
const PORTFOLIO_REGEX = /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.(github\.io|dev|com|io|me|design)\/?[a-zA-Z0-9_-]*/i;

export function extractContactInfo(rawText: string): CandidateContact {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const emailMatch = rawText.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[0] : "";

  const phoneMatch = rawText.match(PHONE_REGEX);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const linkedinMatch = rawText.match(LINKEDIN_REGEX);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  const portfolioMatch = rawText.match(PORTFOLIO_REGEX);
  const portfolio = portfolioMatch && !portfolioMatch[0].includes("linkedin.com") ? portfolioMatch[0] : "";

  // Candidate name heuristic: First line that doesn't contain email, phone, or URLs
  let name = "";
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes("@") &&
      !line.match(PHONE_REGEX) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum vitae") &&
      line.length > 2 &&
      line.length < 50
    ) {
      name = line;
      break;
    }
  }

  // Location heuristic
  let location = "";
  const locationMatch = rawText.match(/([A-Z][a-zA-Z\s]+,\s*([A-Z]{2}|[A-Z][a-zA-Z\s]+))/);
  if (locationMatch && !locationMatch[0].includes("University")) {
    location = locationMatch[0];
  }

  return {
    name,
    email,
    phone,
    location,
    linkedin,
    portfolio,
  };
}
