export const dynamic = "force-static"

export async function GET() {
  const uri = process.env.STANDARD_PUBLICATION_URI

  if (!uri) {
    return new Response("Not Found", { status: 404 })
  }

  return new Response(uri, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
