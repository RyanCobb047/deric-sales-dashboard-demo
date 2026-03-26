#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[2]
CREDENTIALS_ENV = Path('/Users/ryancobb/.openclaw/credentials/.env')
GHL_REQ = WORKSPACE / 'skills/ghl/scripts/ghl_request.sh'
RETELL_SDK = WORKSPACE / 'skills/retell-ai/scripts/retell_sdk.py'
OUT = ROOT / 'data/live-dashboard.json'

REPS = {
    'Jlx8T5hDCbxzKLUSQgrj': 'Jayson',
    'xWVAp9O7wirNMhSoh1Wc': 'Morgan',
    'fdMjKFrzEZ0XKiMTc0e3': 'Nate',
    '7rrRslAqkwldy9MVEdyv': 'Mark',
    'lvfqgS8Udn2DaY5Rey6B': 'Brendon',
    'bAen2S5ekdXjrvnirFdq': 'Derek',
}

MANAGER_ACTIONS = [
    'Pull the top unread inbound queues first. Those are the cleanest manager interventions.',
    'Coach the rep with the highest stale conversation count before pushing more new leads.',
    'Use the Retell feed to spot recent no-connect / voicemail patterns and tighten callback handling.',
    'Treat unanswered inbound conversations as the priority leak before more reporting vanity work.',
]


def load_env_var(name: str, fallback_name: str | None = None) -> str | None:
    if os.getenv(name):
        return os.getenv(name)
    if not CREDENTIALS_ENV.exists():
        return None
    for raw in CREDENTIALS_ENV.read_text(errors='ignore').splitlines():
        if raw.startswith(f'{name}='):
            return raw.split('=', 1)[1].strip().strip('"').strip("'")
        if fallback_name and raw.startswith(f'{fallback_name}='):
            return raw.split('=', 1)[1].strip().strip('"').strip("'")
    return None


def run_json(cmd: list[str], env: dict[str, str]) -> dict | list:
    res = subprocess.run(cmd, env=env, text=True, capture_output=True)
    if res.returncode != 0:
        raise RuntimeError(res.stderr or res.stdout or f'command failed: {cmd}')
    return json.loads(res.stdout)


def to_dt(ms: int | None) -> datetime | None:
    if not ms:
        return None
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc)


def iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def main() -> None:
    env = os.environ.copy()
    ghl_token = load_env_var('GHL_PIT', 'GHL_KEY')
    retell_key = load_env_var('RETELL_API_KEY')
    if not ghl_token:
        raise SystemExit('Missing GHL token (GHL_PIT or GHL_KEY).')
    if not retell_key:
        raise SystemExit('Missing RETELL_API_KEY.')
    env['GHL_PIT'] = ghl_token
    env['RETELL_API_KEY'] = retell_key

    conversations_payload = run_json([
        str(GHL_REQ), 'GET', '/conversations/search',
        '--query', 'locationId=Xxy4lpWL2a1uj0MLYnLN',
        '--query', 'limit=100'
    ], env)
    calls_payload = run_json([
        'python3', str(RETELL_SDK), 'list', 'calls', '--limit', '20'
    ], env)

    conversations = conversations_payload.get('conversations', [])
    calls = calls_payload if isinstance(calls_payload, list) else calls_payload.get('calls', [])

    now = datetime.now(timezone.utc)
    stale_cutoff = now - timedelta(hours=48)
    day_cutoff = now - timedelta(hours=24)

    rep_stats: dict[str, dict] = {
        name: {
            'name': name,
            'assigned': 0,
            'unread': 0,
            'stale': 0,
            'inboundWaiting': 0,
            'active24h': 0,
            'lastTouchAt': None,
            'needsAttentionReason': 'No recent assigned conversation activity found yet.'
        }
        for name in REPS.values()
    }

    recent_queue = []
    for conv in conversations:
        rep_id = conv.get('assignedTo')
        if rep_id not in REPS:
            continue
        rep = rep_stats[REPS[rep_id]]
        last_dt = to_dt(conv.get('lastMessageDate'))
        rep['assigned'] += 1
        rep['unread'] += int(conv.get('unreadCount') or 0)
        if conv.get('lastMessageDirection') == 'inbound' and int(conv.get('unreadCount') or 0) > 0:
            rep['inboundWaiting'] += 1
        if last_dt and last_dt >= day_cutoff:
            rep['active24h'] += 1
        if last_dt and last_dt < stale_cutoff:
            rep['stale'] += 1
        if last_dt and (rep['lastTouchAt'] is None or last_dt > datetime.fromisoformat(rep['lastTouchAt'])):
            rep['lastTouchAt'] = iso(last_dt)
        recent_queue.append({
            'contactName': conv.get('contactName') or conv.get('fullName') or conv.get('phone') or 'Unknown',
            'rep': REPS[rep_id],
            'unread': int(conv.get('unreadCount') or 0),
            'direction': conv.get('lastMessageDirection'),
            'type': conv.get('lastMessageType'),
            'lastMessageBody': conv.get('lastMessageBody') or '',
            'lastTouchAt': iso(last_dt),
        })

    for rep in rep_stats.values():
        if rep['inboundWaiting'] > 0:
            rep['needsAttentionReason'] = f"{rep['inboundWaiting']} inbound conversation(s) waiting on follow-up."
        elif rep['stale'] > 0:
            rep['needsAttentionReason'] = f"{rep['stale']} stale conversation(s) older than 48h."
        elif rep['unread'] > 0:
            rep['needsAttentionReason'] = f"{rep['unread']} unread item(s) sitting in queue."
        else:
            rep['needsAttentionReason'] = 'Queue looks relatively clean in the current sample.'

    rep_cards = sorted(
        rep_stats.values(),
        key=lambda r: (r['inboundWaiting'], r['stale'], r['unread'], -r['active24h']),
        reverse=True,
    )

    needs_attention = [
        {
            'title': f"{rep['name']} has {rep['inboundWaiting']} inbound waiting / {rep['stale']} stale",
            'note': rep['needsAttentionReason'],
        }
        for rep in rep_cards[:4]
    ]

    retell_feed = []
    voicemail_count = 0
    connect_count = 0
    for call in calls[:10]:
        analysis = call.get('call_analysis') or {}
        transcript = (call.get('transcript') or '').strip().replace('\n', ' ')
        successful = bool(analysis.get('call_successful')) and not analysis.get('in_voicemail')
        if analysis.get('in_voicemail'):
            voicemail_count += 1
        if successful:
            connect_count += 1
        retell_feed.append({
            'contact': (call.get('metadata') or {}).get('full_name') or call.get('to_number') or 'Unknown',
            'direction': call.get('direction'),
            'status': 'Connected' if successful else ('Voicemail' if analysis.get('in_voicemail') else 'No connect'),
            'summary': (analysis.get('call_summary') or 'No summary returned.').splitlines()[0].replace('#', '').strip(),
            'timestamp': iso(to_dt(call.get('start_timestamp'))),
            'transcriptSnippet': transcript[:220],
        })

    snapshot = {
        'assignedConversations': sum(r['assigned'] for r in rep_cards),
        'unreadItems': sum(r['unread'] for r in rep_cards),
        'inboundWaiting': sum(r['inboundWaiting'] for r in rep_cards),
        'staleConversations': sum(r['stale'] for r in rep_cards),
        'retellCalls24h': len([c for c in calls if to_dt(c.get('start_timestamp')) and to_dt(c.get('start_timestamp')) >= day_cutoff]),
        'retellVoicemails': voicemail_count,
        'retellConnections': connect_count,
    }

    payload = {
        'generatedAt': iso(now),
        'mode': 'live-mvp',
        'confidence': {
            'level': 'partial',
            'label': 'Partial live data',
            'text': 'Live dashboard currently uses reliable GHL conversation ownership/unread pressure plus recent Retell call activity. It is manager-useful now, but not yet full rep scorecard coverage.'
        },
        'teamSnapshot': snapshot,
        'repCards': rep_cards,
        'needsAttention': needs_attention,
        'managerActions': MANAGER_ACTIONS,
        'recentQueue': sorted(recent_queue, key=lambda x: x['lastTouchAt'] or '', reverse=True)[:12],
        'retellFeed': retell_feed,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))
    print(f'Wrote {OUT}')


if __name__ == '__main__':
    main()
