/**
 * POST /api/vote - アイデアに投票
 */

import { VALID_IDEA_IDS } from './_shared'

interface Env {
  VOTES: KVNamespace
}

interface VoteRequest {
  ideaId: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await context.request.json() as VoteRequest
    const { ideaId } = body

    // バリデーション
    if (!ideaId || !VALID_IDEA_IDS.includes(ideaId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_idea' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // 投票カウントを増加
    const key = `votes:${ideaId}`
    const current = await context.env.VOTES.get(key)
    const newCount = (current ? parseInt(current, 10) : 0) + 1
    await context.env.VOTES.put(key, String(newCount))

    return new Response(
      JSON.stringify({ success: true, votes: newCount }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Failed to vote:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'internal_error' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS リクエスト対応
export const onRequestOptions: PagesFunction = async (context) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
