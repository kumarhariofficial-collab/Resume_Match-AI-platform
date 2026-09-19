import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@resumematch/core-types",
    "@resumematch/resume-parser",
    "@resumematch/jd-analyzer",
    "@resumematch/matching-engine",
    "@resumematch/ats-auditor",
    "@resumematch/ai",
    "@resumematch/export-engine",
  ],
  serverExternalPackages: ["pdf-parse", "mammoth", "docx"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
