export const SYNONYM_MAP: Record<string, string[]> = {
  "sql": ["structured query language", "ms sql", "microsoft sql server", "sql server", "postgres", "postgresql", "t-sql", "pl/sql"],
  "python": ["py", "python3"],
  "power bi": ["powerbi", "pbi", "microsoft power bi", "dax"],
  "tableau": ["tableau desktop", "tableau server"],
  "seo": ["search engine optimization", "search engine marketing"],
  "aws": ["amazon web services", "s3", "ec2", "rds", "redshift", "lambda"],
  "etl": ["extract transform load", "data pipeline", "data integration"],
  "machine learning": ["ml", "deep learning", "ai", "artificial intelligence"],
  "kpi reporting": ["kpi dashboard", "performance metrics", "business metrics"],
  "stakeholder management": ["cross-functional stakeholders", "stakeholder engagement", "client management"],
  "bachelor's degree": ["bs", "b.s.", "bachelor of science", "ba", "b.a.", "degree"],
};

export function areTermsEquivalent(term1: string, term2: string): boolean {
  const t1 = term1.toLowerCase().trim();
  const t2 = term2.toLowerCase().trim();

  if (t1 === t2) return true;

  for (const [key, aliases] of Object.entries(SYNONYM_MAP)) {
    const all = [key, ...aliases];
    if (all.includes(t1) && all.includes(t2)) {
      return true;
    }
  }

  return false;
}
