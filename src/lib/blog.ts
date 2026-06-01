// src/lib/blog.ts
// Blog do Pacto — posts em content/blog/*.md, lidos no build (server).
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string // yyyy-mm-dd
  category: string
  readingMin: number
}
export interface Post extends PostMeta {
  html: string
}

const DIR = path.join(process.cwd(), 'content', 'blog')

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    data[key] = val
  }
  return { data, body: m[2] }
}

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(DIR)) return []
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
}

export function getPostMetas(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const { data, body } = parseFrontmatter(fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8'))
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        date: data.date ?? '',
        category: data.category ?? '',
        readingMin: readingMinutes(body),
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    date: data.date ?? '',
    category: data.category ?? '',
    readingMin: readingMinutes(body),
    html: marked.parse(body, { async: false }) as string,
  }
}
