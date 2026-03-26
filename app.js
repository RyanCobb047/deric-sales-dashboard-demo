const state = {
  data: null,
  selectedRep: null,
};

const els = {
  headerRange: document.getElementById('headerRange'),
  kpiGrid: document.getElementById('kpiGrid'),
  repRanking: document.getElementById('repRanking'),
  attentionList: document.getElementById('attentionList'),
  repCards: document.getElementById('repCards'),
  repDetail: document.getElementById('repDetail'),
  detailName: document.getElementById('detailName'),
  managerActions: document.getElementById('managerActions'),
  confidenceBadge: document.getElementById('confidenceBadge'),
  confidenceText: document.getElementById('confidenceText'),
  promptList: document.getElementById('promptList'),
  rangeButtons: document.getElementById('rangeButtons'),
};

const prompts = [
  'Who needs attention first right now based on unread inbound and stale conversations?',
  'Give me manager actions from this live dashboard, not just observations.',
  'Which rep has the messiest queue today and why?',
  'What does the recent Retell call feed suggest we should coach next?',
  'Show me where the team is letting inbound follow-up sit.'
];

function scoreForRep(rep) {
  const pressure = rep.inboundWaiting * 5 + rep.stale * 3 + rep.unread;
  return Math.max(35, 100 - pressure);
}

function scoreClass(score) {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
}

function rankingClass(index) {
  if (index < 2) return 'rank-low';
  if (index < 4) return 'rank-mid';
  return 'rank-top';
}

function fmtTs(ts) {
  if (!ts) return 'Unknown';
  const d = new Date(ts);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function renderPrompts() {
  els.promptList.innerHTML = prompts.map(prompt => `
    <div class="prompt-item" onclick="copyPrompt(${JSON.stringify(prompt)})">
      <strong>${prompt}</strong>
      <div class="item-meta">Tap to copy prompt for @FFI_MaxBot</div>
    </div>
  `).join('');
}

window.copyPrompt = async function(prompt) {
  try {
    await navigator.clipboard.writeText(`@FFI_MaxBot ${prompt}`);
    alert('Copied prompt for Telegram thread.');
  } catch {
    alert(`Copy this into Telegram:\n\n@FFI_MaxBot ${prompt}`);
  }
}

function render() {
  const data = state.data;
  if (!data) return;
  els.headerRange.textContent = `Live Manager Action View · Updated ${fmtTs(data.generatedAt)}`;

  const snapshot = data.teamSnapshot;
  const kpis = [
    { label: 'Assigned conversations', value: snapshot.assignedConversations, sub: 'Owned queue across core reps' },
    { label: 'Unread items', value: snapshot.unreadItems, sub: 'Anything sitting here is decision pressure' },
    { label: 'Inbound waiting', value: snapshot.inboundWaiting, sub: 'This is the immediate follow-up leak' },
    { label: 'Stale conversations', value: snapshot.staleConversations, sub: 'No touch in 48h+' },
    { label: 'Retell calls (24h)', value: snapshot.retellCalls24h, sub: 'Recent AI call activity' },
    { label: 'Voicemails', value: snapshot.retellVoicemails, sub: 'Recent no-connect pattern' },
    { label: 'Retell connects', value: snapshot.retellConnections, sub: 'Connected AI calls in sample' },
    { label: 'Mode', value: 'MVP', sub: 'Live data, not full scorecard yet' },
  ];

  els.kpiGrid.innerHTML = kpis.map(kpi => `
    <div class="kpi-card">
      <div class="label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
      <div class="kpi-sub">${kpi.sub}</div>
    </div>
  `).join('');

  const ranked = [...data.repCards].sort((a, b) => (b.inboundWaiting - a.inboundWaiting) || (b.stale - a.stale) || (b.unread - a.unread));
  els.repRanking.innerHTML = ranked.map((rep, index) => `
    <div class="rank-item ${rankingClass(index)}">
      <div class="item-row"><strong>#${index + 1} ${rep.name}</strong><strong>${rep.inboundWaiting} waiting</strong></div>
      <div class="item-meta">${rep.needsAttentionReason}</div>
    </div>
  `).join('');

  els.attentionList.innerHTML = data.needsAttention.map(item => `
    <div class="attention-item">
      <div class="item-row"><strong>${item.title}</strong></div>
      <div class="item-meta">${item.note}</div>
    </div>
  `).join('');

  els.repCards.innerHTML = data.repCards.map(rep => {
    const score = scoreForRep(rep);
    return `
      <div class="rep-card ${state.selectedRep === rep.name ? 'active' : ''}" onclick="selectRep('${rep.name.replace(/'/g, "\\'")}')">
        <div class="rep-card-header">
          <div>
            <div class="label">${rep.inboundWaiting > 0 ? 'Needs follow-up pressure relief' : rep.stale > 0 ? 'Queue getting stale' : 'Relatively clean queue'}</div>
            <h3>${rep.name}</h3>
          </div>
          <div class="score-badge ${scoreClass(score)}">${score}</div>
        </div>
        <div class="metrics-row">
          <div class="metric-box"><div class="label">Assigned</div><div class="num">${rep.assigned}</div></div>
          <div class="metric-box"><div class="label">Unread</div><div class="num">${rep.unread}</div></div>
          <div class="metric-box"><div class="label">Stale</div><div class="num">${rep.stale}</div></div>
        </div>
        <div class="rep-note">${rep.needsAttentionReason}</div>
      </div>
    `;
  }).join('');

  if (!state.selectedRep && data.repCards.length) state.selectedRep = data.repCards[0].name;
  renderRepDetail(data.repCards.find(r => r.name === state.selectedRep) || data.repCards[0]);

  els.managerActions.innerHTML = data.managerActions.map((action, idx) => `
    <div class="action-item"><div class="item-row"><strong>${idx + 1}. ${action}</strong></div></div>
  `).join('') + `
    <div class="action-item">
      <div class="item-row"><strong>Refresh cadence</strong></div>
      <div class="item-meta">Data file generated at ${fmtTs(data.generatedAt)}. Scheduled sync can keep this fresh without exposing secrets in the browser.</div>
    </div>`;

  els.confidenceBadge.className = `confidence ${data.confidence.level}`;
  els.confidenceBadge.textContent = data.confidence.label;
  els.confidenceText.textContent = data.confidence.text;
}

function renderRepDetail(rep) {
  if (!rep) return;
  const data = state.data;
  const queue = data.recentQueue.filter(item => item.rep === rep.name).slice(0, 4);
  els.detailName.textContent = rep.name;
  els.repDetail.innerHTML = `
    <div class="detail-chip-row">
      <div class="chip">Assigned: ${rep.assigned}</div>
      <div class="chip">Unread: ${rep.unread}</div>
      <div class="chip">Inbound waiting: ${rep.inboundWaiting}</div>
      <div class="chip">Stale 48h+: ${rep.stale}</div>
    </div>
    <div class="coaching-box">
      <div class="label">Manager read</div>
      <p class="rep-note">${rep.needsAttentionReason}</p>
    </div>
    <div class="detail-section">
      <div class="label">Last touch</div>
      <p class="rep-note">${fmtTs(rep.lastTouchAt)}</p>
    </div>
    <div class="detail-section">
      <div class="label">Recent queue samples</div>
      ${queue.length ? queue.map(item => `<p class="rep-note">• ${item.contactName} — ${item.direction || 'unknown'} / ${item.type || 'unknown'} / unread ${item.unread} / ${fmtTs(item.lastTouchAt)}</p>`).join('') : '<p class="rep-note">No recent queue samples in the current fetch.</p>'}
    </div>
    <div class="detail-section">
      <div class="label">Retell feed</div>
      ${data.retellFeed.slice(0, 3).map(call => `<p class="rep-note">• ${call.contact} — ${call.status} — ${fmtTs(call.timestamp)}</p>`).join('')}
    </div>
  `;
}

window.selectRep = function(name) {
  state.selectedRep = name;
  render();
}

async function boot() {
  renderPrompts();
  els.rangeButtons.innerHTML = '<div class="muted small">Live mode uses a synced data file instead of manual date-range toggles.</div>';
  const res = await fetch('data/live-dashboard.json', { cache: 'no-store' });
  state.data = await res.json();
  render();
}

boot().catch(err => {
  console.error(err);
  els.kpiGrid.innerHTML = `<div class="panel"><h3>Could not load live data</h3><p class="rep-note">${err.message}</p></div>`;
});
