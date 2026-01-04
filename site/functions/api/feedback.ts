/**
 * POST /api/feedback - フィードバック送信
 * GET /api/feedback - フィードバック一覧取得（管理用）
 */

interface Env {
  VOTES: KVNamespace
}

interface FeedbackRequest {
  message: string
  type: 'idea' | 'bug' | 'praise' | 'other'
  platform?: 'web' | 'ios' | 'android'
}

interface FeedbackEntry {
  id: string
  message: string
  type: string
  platform: string
  createdAt: string
}

const FEEDBACK_LIST_KEY = 'feedback:list'
const MAX_FEEDBACKS = 500

// POST - フィードバック送信
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const body = await context.request.json() as FeedbackRequest
    const { message, type, platform = 'web' } = body

    // バリデーション
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'message_required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'message_too_long' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const validTypes = ['idea', 'bug', 'praise', 'other']
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_type' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // フィードバックエントリ作成
    const entry: FeedbackEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: message.trim(),
      type,
      platform,
      createdAt: new Date().toISOString(),
    }

    // 既存リストを取得
    const existingData = await context.env.VOTES.get(FEEDBACK_LIST_KEY)
    const feedbacks: FeedbackEntry[] = existingData ? JSON.parse(existingData) : []

    // 新しいフィードバックを先頭に追加
    feedbacks.unshift(entry)

    // 最大件数を超えたら古いものを削除
    if (feedbacks.length > MAX_FEEDBACKS) {
      feedbacks.splice(MAX_FEEDBACKS)
    }

    // 保存
    await context.env.VOTES.put(FEEDBACK_LIST_KEY, JSON.stringify(feedbacks))

    return new Response(
      JSON.stringify({ success: true, id: entry.id }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'internal_error' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

// GET - フィードバック一覧取得（管理用）
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const existingData = await context.env.VOTES.get(FEEDBACK_LIST_KEY)
    const feedbacks: FeedbackEntry[] = existingData ? JSON.parse(existingData) : []

    return new Response(
      JSON.stringify({ feedbacks, total: feedbacks.length }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS リクエスト対応
export const onRequestOptions: PagesFunction = async (context) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
