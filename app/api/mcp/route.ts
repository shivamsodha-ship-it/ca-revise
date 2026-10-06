import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { sha } from '@/lib/auth';
import { database } from '@/lib/db';
import { TOOLS, callTool } from '@/lib/mcpTools';

// MCP endpoint (Streamable HTTP, JSON responses). Claude Desktop, Claude Code and claude.ai connectors call it
// with the connector key from the account page as a bearer token. Read-only.
export const dynamic = 'force-dynamic';

const PROTOCOL = '2025-06-18';

async function userForKey(req: Request): Promise<string | null> {
  const m = /^Bearer (.+)$/.exec(req.headers.get('authorization') ?? '');
  if (!m || m[1].length > 100) return null;
  const db = await database();
  const k = await db.collection('connectorKeys').findOne({ keyHash: sha(m[1]) });
  if (!k) return null;
  void db.collection('connectorKeys').updateOne({ _id: k._id }, { $set: { lastUsed: new Date() } });
  return String(k.userId);
}

const rpcError = (id: unknown, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handle(msg: any, userId: string): Promise<object | null> {
  const id = msg?.id;
  const isRequest = id !== undefined && id !== null;
  switch (msg?.method) {
    case 'initialize':
      return { jsonrpc: '2.0', id, result: {
        protocolVersion: PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: 'ca-revise', version: '1.0.0' },
        instructions: 'Read-only access to the user\'s CA Final study progress in CA Revise. Start with weak_concepts or chapter_progress.',
      } };
    case 'ping':
      return isRequest ? { jsonrpc: '2.0', id, result: {} } : null;
    case 'tools/list':
      return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    case 'tools/call': {
      const name = msg.params?.name;
      if (!TOOLS.some(t => t.name === name)) return rpcError(id, -32602, `Unknown tool: ${name}`);
      try {
        const text = await callTool(name, msg.params?.arguments ?? {}, userId);
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } };
      } catch (e: any) {
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: e?.message ?? 'Tool failed.' }], isError: true } };
      }
    }
    default:
      if (!isRequest) return null;   // notifications such as notifications/initialized get no reply
      return rpcError(id, -32601, `Method not found: ${msg?.method}`);
  }
}

export async function POST(req: Request) {
  const userId = await userForKey(req);
  if (!userId) return new NextResponse(JSON.stringify({ error: 'unauthorised' }), {
    status: 401, headers: { 'content-type': 'application/json', 'www-authenticate': 'Bearer' },
  });
  let body: unknown;
  try { body = JSON.parse(await req.text()); } catch {
    return NextResponse.json(rpcError(null, -32700, 'Parse error'), { status: 400 });
  }
  const messages = Array.isArray(body) ? body : [body];
  const replies = (await Promise.all(messages.map(m => handle(m, userId)))).filter(Boolean);
  if (!replies.length) return new NextResponse(null, { status: 202 });
  return NextResponse.json(Array.isArray(body) ? replies : replies[0]);
}

export async function GET() { return new NextResponse(null, { status: 405, headers: { allow: 'POST' } }); }
export async function DELETE() { return new NextResponse(null, { status: 405, headers: { allow: 'POST' } }); }
