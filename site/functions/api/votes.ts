/**
 * GET /api/votes - 全アイデアの投票数を取得
 */

import { VALID_IDEA_IDS } from './_shared'

interface Env {
  VOTES: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 全アイデアの投票数を取得
    const votes: Record<string, number> = {}

    await Promise.all(
      VALID_IDEA_IDS.map(async (ideaId) => {
        const count = await context.env.VOTES.get(`votes:${ideaId}`)
        votes[ideaId] = count ? parseInt(count, 10) : 0
      })
    )

    return new Response(JSON.stringify({ votes }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Failed to fetch votes:', error)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}
