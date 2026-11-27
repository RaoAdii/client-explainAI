import sharp from "sharp";
import type { ProjectInput } from "@/lib/projects/schema";
import type { InfographicPlan } from "./groq";
import { DISCLAIMER } from "./prompt";

const WIDTH = 1200;
const HEIGHT = 1500;

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function wrapText(value: string, maxCharacters: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxCharacters) line = next;
    else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const consumed = lines.join(" ").length;
  if (consumed < value.trim().length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:]?$/, "")}…`;
  return lines;
}

function textLines(lines: string[], x: number, y: number, lineHeight: number, className: string) {
  return `<text x="${x}" y="${y}" class="${className}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

export function renderInfographicSvg(plan: InfographicPlan, project: ProjectInput): string {
  const count = plan.steps.length;
  const cardsTop = 390;
  const cardsBottom = 1260;
  const gap = 16;
  const cardHeight = Math.floor((cardsBottom - cardsTop - gap * (count - 1)) / count);
  const title = textLines(wrapText(plan.title, 34, 2), 76, 130, 60, "title");
  const subtitle = textLines(wrapText(plan.subtitle, 72, 2), 78, 255, 32, "subtitle");
  const cards = plan.steps.map((step, index) => {
    const y = cardsTop + index * (cardHeight + gap);
    const bodyLines = wrapText(step.description, 88, cardHeight >= 180 ? 3 : 2);
    return `<g>
      <rect x="76" y="${y}" width="1048" height="${cardHeight}" rx="22" fill="#FFFFFF" stroke="#D9D7CF" stroke-width="2"/>
      <circle cx="132" cy="${y + 52}" r="30" fill="#EDF2F2"/>
      <text x="132" y="${y + 62}" text-anchor="middle" class="number">${String(index + 1).padStart(2, "0")}</text>
      ${textLines(wrapText(step.title, 45, 1), 188, y + 48, 0, "stepTitle")}
      ${textLines(bodyLines, 188, y + 88, 27, "stepBody")}
      ${index < count - 1 ? `<path d="M132 ${y + cardHeight} L132 ${y + cardHeight + gap}" stroke="#C27A24" stroke-width="4"/>` : ""}
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#F8F7F3"/>
    <rect x="0" y="0" width="18" height="1500" fill="#C27A24"/>
    <style>
      text { font-family: Arial, Helvetica, sans-serif; }
      .eyebrow { font-size: 19px; font-weight: 700; letter-spacing: 3px; fill: #9A5F19; }
      .title { font-size: 52px; font-weight: 700; letter-spacing: -1px; fill: #183640; }
      .subtitle { font-size: 25px; fill: #5E696B; }
      .meta { font-size: 18px; font-weight: 600; fill: #315D6A; }
      .number { font-size: 19px; font-weight: 700; fill: #234955; }
      .stepTitle { font-size: 25px; font-weight: 700; fill: #1C2529; }
      .stepBody { font-size: 20px; fill: #566164; }
      .note { font-size: 17px; fill: #5E696B; }
      .footer { font-size: 15px; fill: #6C7473; }
    </style>
    <text x="78" y="70" class="eyebrow">CLIENT PROCESS GUIDE</text>
    ${title}
    ${subtitle}
    <rect x="76" y="320" width="1048" height="48" rx="14" fill="#EDF2F2"/>
    <text x="98" y="351" class="meta">${escapeXml(project.legalArea)}  ·  ${escapeXml(project.jurisdiction)}</text>
    ${cards}
    ${textLines(wrapText(plan.variabilityNote || "Local procedure may vary.", 105, 2), 78, 1320, 25, "note")}
    <line x1="76" y1="1385" x2="1124" y2="1385" stroke="#D9D7CF" stroke-width="2"/>
    <text x="78" y="1426" class="footer">${escapeXml(DISCLAIMER)}.</text>
    <text x="78" y="1460" class="footer">Prepared for: ${escapeXml(project.targetAudience)}</text>
  </svg>`;
}

export async function renderInfographicPng(plan: InfographicPlan, project: ProjectInput): Promise<Buffer> {
  return sharp(Buffer.from(renderInfographicSvg(plan, project))).png({ compressionLevel: 9 }).toBuffer();
}
