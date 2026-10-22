import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 사이트맵 lastmod 용으로 글 슬러그 → 마지막 수정 시각을 만든다.
 * astro.config 단계에서는 content collection 을 쓸 수 없어 frontmatter 를 직접 읽는다.
 * 글은 src/content/posts 바로 아래 평평하게 두므로 파일명(확장자 제외)이 곧 URL 슬러그다.
 */
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
const PUB_RE = /^pubDatetime:\s*["']?([^"'\s]+)["']?\s*$/m;
const MOD_RE = /^modDatetime:\s*["']?([^"'\s]+)["']?\s*$/m;
const POST_FILE_RE = /^[^_].*\.mdx?$/;

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function getPostLastmodMap(postsDir: string): Map<string, Date> {
  const lastmods = new Map<string, Date>();
  for (const file of readdirSync(postsDir)) {
    if (!POST_FILE_RE.test(file)) continue;
    const frontmatter =
      FRONTMATTER_RE.exec(readFileSync(join(postsDir, file), "utf-8"))?.[1] ??
      "";
    const lastmod =
      parseDate(MOD_RE.exec(frontmatter)?.[1]) ??
      parseDate(PUB_RE.exec(frontmatter)?.[1]);
    if (lastmod) lastmods.set(file.replace(/\.mdx?$/, ""), lastmod);
  }
  return lastmods;
}
