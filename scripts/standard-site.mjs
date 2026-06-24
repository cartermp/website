#!/usr/bin/env node
import { AtpAgent } from "@atproto/api"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const POSTS_DIR = path.join(ROOT, "content", "posts")

const HANDLE = process.env.BSKY_HANDLE
const APP_PASSWORD = process.env.BSKY_APP_PASSWORD
const SERVICE = process.env.BSKY_SERVICE ?? "https://bsky.social"
const PUB_NAME = process.env.STANDARD_PUBLICATION_NAME ?? "Phillip Carter"
const PUB_URL = process.env.STANDARD_PUBLICATION_URL ?? "https://phillipcarter.dev"
const PUB_DESCRIPTION =
  process.env.STANDARD_PUBLICATION_DESCRIPTION ?? "Phillip Carter's spot on the web."
const PUB_COLLECTION = "site.standard.publication"
const DOC_COLLECTION = "site.standard.document"

function isTid(rkey) {
  return /^[234567abcdefghijklmnopqrstuvwxyz]{13}$/.test(rkey)
}

if (!HANDLE || !APP_PASSWORD) {
  console.error("Missing env: set BSKY_HANDLE and BSKY_APP_PASSWORD.")
  process.exit(1)
}

const agent = new AtpAgent({ service: SERVICE })
await agent.login({ identifier: HANDLE, password: APP_PASSWORD })
const did = agent.session?.did
if (!did) {
  console.error("Login succeeded but no DID on session.")
  process.exit(1)
}
console.log(`Logged in as ${HANDLE} (${did}) via ${SERVICE}`)

async function ensurePublication() {
  const record = {
    $type: PUB_COLLECTION,
    url: PUB_URL,
    name: PUB_NAME,
    description: PUB_DESCRIPTION,
    preferences: { showInDiscover: true },
  }

  const list = await agent.com.atproto.repo.listRecords({
    repo: did,
    collection: PUB_COLLECTION,
    limit: 100,
  })

  // The site.standard.publication lexicon requires a TID rkey. Delete any
  // legacy non-TID records (e.g. `self`) so they don't shadow the new one.
  let reusable = null
  for (const r of list.data.records) {
    const rkey = r.uri.split("/").pop()
    if (!isTid(rkey)) {
      await agent.com.atproto.repo.deleteRecord({
        repo: did,
        collection: PUB_COLLECTION,
        rkey,
      })
      console.log(`  deleted legacy publication ${r.uri}`)
    } else if (r.value?.url === PUB_URL) {
      reusable = { uri: r.uri, rkey }
    }
  }

  if (reusable) {
    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: PUB_COLLECTION,
      rkey: reusable.rkey,
      record,
    })
    console.log(`Publication (updated): ${reusable.uri}`)
    return reusable.uri
  }

  const res = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: PUB_COLLECTION,
    record,
  })
  console.log(`Publication (created): ${res.data.uri}`)
  return res.data.uri
}

async function repointDocuments(newSiteUri) {
  if (!newSiteUri) {
    console.error("Need publication AT-URI (arg or STANDARD_PUBLICATION_URI env).")
    process.exit(1)
  }
  let cursor
  let updated = 0
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: DOC_COLLECTION,
      limit: 100,
      cursor,
    })
    for (const r of res.data.records) {
      if (r.value?.site === newSiteUri) continue
      const rkey = r.uri.split("/").pop()
      const record = { ...r.value, site: newSiteUri }
      await agent.com.atproto.repo.putRecord({
        repo: did,
        collection: DOC_COLLECTION,
        rkey,
        record,
      })
      console.log(`  updated ${r.uri}`)
      updated++
    }
    cursor = res.data.cursor
  } while (cursor)
  console.log(`Updated ${updated} document records.`)
}

async function resetDocuments() {
  // Delete every site.standard.document record under this repo and strip
  // standardUri lines from post frontmatter.
  let cursor
  let deleted = 0
  do {
    const res = await agent.com.atproto.repo.listRecords({
      repo: did,
      collection: DOC_COLLECTION,
      limit: 100,
      cursor,
    })
    for (const r of res.data.records) {
      const rkey = r.uri.split("/").pop()
      await agent.com.atproto.repo.deleteRecord({
        repo: did,
        collection: DOC_COLLECTION,
        rkey,
      })
      console.log(`  deleted ${r.uri}`)
      deleted++
    }
    cursor = res.data.cursor
  } while (cursor)
  console.log(`Deleted ${deleted} document records.`)

  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".mdx"))
  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file)
    const raw = await fs.readFile(fullPath, "utf8")
    const stripped = raw.replace(/^standardUri:.*\r?\n/m, "")
    if (stripped !== raw) {
      await fs.writeFile(fullPath, stripped)
      console.log(`  stripped standardUri from ${file}`)
    }
  }
}

async function backfillDocuments(siteUri) {
  if (!siteUri) {
    console.error("Need publication AT-URI (arg or STANDARD_PUBLICATION_URI env).")
    process.exit(1)
  }
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".mdx")).sort()
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "")
    const fullPath = path.join(POSTS_DIR, file)
    const raw = await fs.readFile(fullPath, "utf8")
    const parsed = matter(raw)

    if (parsed.data.standardUri) {
      console.log(`  skip ${slug} (already has standardUri)`)
      continue
    }
    if (!parsed.data.title || !parsed.data.date) {
      console.log(`  skip ${slug} (missing title or date)`)
      continue
    }

    const publishedAt = new Date(parsed.data.date).toISOString()
    const tagsRaw = parsed.data.tags
    const tags =
      typeof tagsRaw === "string"
        ? tagsRaw.split(/[\s,]+/).filter(Boolean)
        : Array.isArray(tagsRaw)
          ? tagsRaw
          : undefined

    const record = {
      $type: DOC_COLLECTION,
      site: siteUri,
      path: `/posts/${slug}`,
      title: parsed.data.title,
      publishedAt,
      ...(parsed.data.description ? { description: parsed.data.description } : {}),
      ...(tags && tags.length ? { tags } : {}),
    }

    // No explicit rkey — the PDS generates a TID, which the site.standard.document
    // lexicon requires.
    const res = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: DOC_COLLECTION,
      record,
    })
    const uri = res.data.uri
    console.log(`  ${slug} -> ${uri}`)

    await fs.writeFile(fullPath, injectStandardUri(raw, uri))
  }
}

function injectStandardUri(source, uri) {
  // Insert `standardUri: "<uri>"` before the closing `---` of the frontmatter,
  // preserving all existing formatting.
  const fmMatch = source.match(/^---\r?\n([\s\S]*?\r?\n)---(\r?\n|$)/)
  if (!fmMatch) {
    throw new Error("No frontmatter block found")
  }
  const [, body, trailingNewline] = fmMatch
  const newBody = body.endsWith("\n") ? body : body + "\n"
  const newFrontmatter = `---\n${newBody}standardUri: "${uri}"\n---${trailingNewline}`
  return source.replace(fmMatch[0], newFrontmatter)
}

const command = process.argv[2]

if (command === "publication") {
  await ensurePublication()
} else if (command === "documents") {
  const uri = process.argv[3] || process.env.STANDARD_PUBLICATION_URI
  await backfillDocuments(uri)
} else if (command === "reset-documents") {
  await resetDocuments()
} else if (command === "repoint-documents") {
  const uri = process.argv[3] || process.env.STANDARD_PUBLICATION_URI
  await repointDocuments(uri)
} else if (command === "all") {
  const uri = await ensurePublication()
  await backfillDocuments(uri)
  await repointDocuments(uri)
} else {
  console.error(
    "Usage: node scripts/standard-site.mjs <publication | documents [at://...] | reset-documents | repoint-documents [at://...] | all>",
  )
  process.exit(1)
}
