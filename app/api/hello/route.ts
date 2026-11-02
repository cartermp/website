export const dynamic = "force-static"

export async function GET(_: Request) {
  return new Response('You found my API! This is the only route.')
}
