import { WorkExperience } from "@resumematch/core-types";

const DATE_RANGE_REGEX = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\s*[-–—\s]\s*(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})/i;
const QUANTIFIED_METRIC_REGEX = /(\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[kKMbB]?|\b\d+\s*(?:hrs|hours|days|users|clients|projects|million|billion|k|TB|GB|MB)\b)/i;

export function parseWorkExperienceSection(experienceText: string): WorkExperience[] {
  if (!experienceText.trim()) return [];

  const lines = experienceText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: WorkExperience[] = [];

  let currentItem: Partial<WorkExperience> | null = null;

  for (const line of lines) {
    const isBullet = /^[•\-*▪\d+\.]\s*/.test(line);
    const dateMatch = line.match(DATE_RANGE_REGEX);

    if (dateMatch && currentItem && (!currentItem.bullets || currentItem.bullets.length === 0) && !currentItem.startDate) {
      const dates = dateMatch[0].split(/[-–—]/);
      currentItem.startDate = dates[0]?.trim() || "";
      currentItem.endDate = dates[1]?.trim() || "Present";
    } else if (dateMatch || (!isBullet && line.length < 80 && line.includes("|"))) {
      if (currentItem && (currentItem.title || currentItem.company || (currentItem.bullets && currentItem.bullets.length > 0))) {
        items.push(finalizeWorkExperience(currentItem));
      }

      const parts = line.split(/[|•–—]/).map((p) => p.trim());
      currentItem = {
        company: parts[0] || "",
        title: parts[1] || parts[0] || "",
        startDate: dateMatch ? dateMatch[0].split(/[-–—]/)[0]?.trim() : "",
        endDate: dateMatch ? dateMatch[0].split(/[-–—]/)[1]?.trim() : "Present",
        bullets: [],
      };
    } else if (currentItem) {
      const cleanBullet = line.replace(/^[•\-*▪\d+\.]\s*/, "").trim();
      if (cleanBullet) {
        if (!currentItem.bullets) currentItem.bullets = [];
        currentItem.bullets.push(cleanBullet);
      }
    } else {
      const cleanLine = line.replace(/^[•\-*▪\d+\.]\s*/, "").trim();
      currentItem = {
        company: cleanLine,
        title: cleanLine,
        startDate: "",
        endDate: "",
        bullets: [],
      };
    }
  }

  if (currentItem && (currentItem.title || currentItem.company || (currentItem.bullets && currentItem.bullets.length > 0))) {
    items.push(finalizeWorkExperience(currentItem));
  }

  return items;
}

function finalizeWorkExperience(item: Partial<WorkExperience>): WorkExperience {
  const bullets = item.bullets || [];
  let quantifiedCount = 0;

  for (const bullet of bullets) {
    if (QUANTIFIED_METRIC_REGEX.test(bullet)) {
      quantifiedCount++;
    }
  }

  return {
    id: `exp-${Math.random().toString(36).substring(2, 9)}`,
    company: item.company || "Company",
    title: item.title || "Role",
    startDate: item.startDate || "",
    endDate: item.endDate || "Present",
    location: item.location || "",
    bullets,
    quantifiedBulletsCount: quantifiedCount,
  };
}
