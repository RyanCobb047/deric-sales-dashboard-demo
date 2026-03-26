const state = {
  data: null,
  selectedRep: null,
  selectedRetellCallId: null,
  copilotQuery: '',
  copilotResponse: null,
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
  retellCards: document.getElementById('retellCards'),
  retellCallList: document.getElementById('retellCallList'),
  retellDetail: document.getElementById('retellDetail'),
  retellDetailName: document.getElementById('retellDetailName'),
  retellMeta: document.getElementById('retellMeta'),
  copilotPromptChips: document.getElementById('copilotPromptChips'),
  copilotInput: document.getElementById('copilotInput'),
  copilotAskButton: document.getElementById('copilotAskButton'),
  copilotOutput: document.getElementById('copilotOutput'),
  copilotUpdatedAt: document.getElementById('copilotUpdatedAt'),
};

const suggestedPrompts = [
  'Who needs attention first right now based on unread inbound and stale conversations?',
  'What changed in the last live snapshot that I should care about?',
  'Give me manager actions from this live dashboard, not just observations.',
  'Which rep has the messiest queue today and why?',
  'What does the recent Retell call feed suggest we should coach next?'
];

function scoreForRep(rep) {
  const pressure = rep.inboundWaiting * 7 + rep.stale * 5 + rep.unread * 2;
  return Math.max(25, 100 - pressure);
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPrompts() {
  els.promptList.innerHTML = suggestedPrompts.map(prompt => `
    <div class="prompt-item" onclick="copyPrompt(${JSON.stringify(prompt)})">
      <strong>${escapeHtml(prompt)}</strong>
      <div class="item-meta">Tap to copy prompt for @FFI_MaxBot</div>
    </div>
  `).join('');

  els.copilotPromptChips.innerHTML = suggestedPrompts.map(prompt => `
    <button class="copilot-chip" onclick="runSuggestedPrompt(${JSON.stringify(prompt)})">${escapeHtml(prompt)}</button>
  `).join('');
}

window.copyPrompt = async function(prompt) {
  try {
    await navigator.clipboard.writeText(`@FFI_MaxBot ${prompt}`);
    alert('Copied prompt for Telegram thread.');
  } catch {
    alert(`Copy this into Telegram:\n\n@FFI_MaxBot ${prompt}`);
  }
};

function buildCopilotContext(data) {
  const repInsights = [...data.repCards]
    .map(rep => {
      const queueSample = data.recentQueue.filter(item => item.rep === rep.name);
      const lastInbound = queueSample.find(item => item.direction === 'inbound');
      const pressureScore = rep.inboundWaiting * 7 + rep.unread * 2 + rep.stale * 5;
      return {
        ...rep,
        pressureScore,
        score: scoreForRep(rep),
        queueSample,
        lastInbound,
      };
    })
    .sort((a, b) => b.pressureScore - a.pressureScore || new Date(a.lastTouchAt) - new Date(b.lastTouchAt));

  const retellCalls = data.retellModule?.calls || data.retellFeed || [];
  const connectedCalls = retellCalls.filter(call => (call.status || '').toLowerCase().includes('connected'));
  const voicemailCalls = retellCalls.filter(call => (call.status || '').toLowerCase().includes('voicemail'));
  const noConnectCalls = retellCalls.filter(call => (call.status || '').toLowerCase().includes('no connect'));
  const latestCalls = [...retellCalls].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const topRep = repInsights[0] || null;
  const secondRep = repInsights[1] || null;

  const rankedPriorities = [
    topRep && {
      title: `${topRep.name} needs the first manager intervention`,
      reason: `${topRep.inboundWaiting} inbound waiting, ${topRep.unread} unread, ${topRep.stale} stale. ${topRep.needsAttentionReason}`,
      owner: topRep.name,
      urgency: 'highest',
    },
    secondRep && {
      title: `${secondRep.name} is the next queue pressure risk`,
      reason: `${secondRep.inboundWaiting} inbound waiting and ${secondRep.unread} unread. Keep the pileup from spreading.`,
      owner: secondRep.name,
      urgency: 'high',
    },
    voicemailCalls.length && {
      title: 'Retell callback discipline needs attention',
      reason: `${voicemailCalls.length} voicemail outcomes in the live lookback. Tighten callback timing before touching script polish.`,
      owner: 'Manager / AI lane',
      urgency: 'high',
    },
    connectedCalls.length && {
      title: 'Review connected Retell calls for coaching signal',
      reason: `${connectedCalls.length} connected calls exist in the last ${data.retellModule?.lookbackHours || 36} hours and are the fastest source of concrete coaching clips.`,
      owner: 'Manager',
      urgency: 'medium',
    }
  ].filter(Boolean);

  const whoNeedsAttention = repInsights.slice(0, 4).map(rep => ({
    name: rep.name,
    reason: `${rep.inboundWaiting} inbound waiting · ${rep.unread} unread · last touch ${fmtTs(rep.lastTouchAt)}`,
    nextMove: rep.lastInbound
      ? `Start with ${rep.lastInbound.contactName}; latest inbound sample is ${rep.lastInbound.type || 'unknown'} and still waiting.`
      : 'Clear the oldest waiting inbound item first and force same-day response.',
  }));

  const changes = [
    `${data.teamSnapshot.inboundWaiting} inbound conversations are waiting across the team right now.`,
    `${data.teamSnapshot.unreadItems} unread items are sitting in owned queues.`,
    `${voicemailCalls.length} voicemail outcomes vs ${connectedCalls.length} connected Retell calls in the current review window.`,
    topRep ? `${topRep.name} is carrying the heaviest live pressure with ${topRep.inboundWaiting} inbound waiting.` : null,
  ].filter(Boolean);

  const nextActions = [
    topRep ? `Pull ${topRep.name}'s oldest inbound waiting conversations first and get same-day follow-up moving.` : null,
    secondRep ? `Have ${secondRep.name} clean unread items before taking more fresh leads.` : null,
    voicemailCalls.length ? 'Review the voicemail-heavy Retell outcomes and tighten callback sequencing + retry timing.' : null,
    connectedCalls[0] ? `Listen to ${connectedCalls[0].contact}'s connected call for the best current coaching clip.` : null,
  ].filter(Boolean);

  return {
    generatedAt: data.generatedAt,
    confidence: data.confidence,
    teamSnapshot: data.teamSnapshot,
    repInsights,
    retell: {
      calls: latestCalls,
      connectedCalls,
      voicemailCalls,
      noConnectCalls,
    },
    rankedPriorities,
    whoNeedsAttention,
    changes,
    nextActions,
  };
}

function buildCopilotResponse(query, context) {
  const normalized = (query || '').trim().toLowerCase();
  const topRep = context.repInsights[0];
  const secondRep = context.repInsights[1];
  const latestConnected = context.retell.connectedCalls[0];

  const defaultSummary = [
    topRep ? `${topRep.name} is the top pressure point with ${topRep.inboundWaiting} inbound waiting and ${topRep.unread} unread.` : null,
    secondRep ? `${secondRep.name} is next and should be cleared before more queue load lands.` : null,
    context.retell.voicemailCalls.length ? `${context.retell.voicemailCalls.length} voicemail outcomes are showing callback execution pressure.` : null,
  ].filter(Boolean).join(' ');

  let headline = 'Manager snapshot from live dashboard';
  let summary = defaultSummary;

  if (!normalized) {
    headline = 'Ask Deric is ready';
    summary = 'Use a suggested prompt or ask in plain English. Answers are generated from the live dashboard snapshot, not hardcoded canned text.';
  } else if (normalized.includes('attention') || normalized.includes('first')) {
    headline = topRep ? `${topRep.name} needs attention first` : headline;
    summary = topRep
      ? `${topRep.name} has the highest queue pressure in the live snapshot: ${topRep.inboundWaiting} inbound waiting, ${topRep.unread} unread, ${topRep.stale} stale. Start there before anything else.`
      : defaultSummary;
  } else if (normalized.includes('change')) {
    headline = 'What changed that matters';
    summary = `The dashboard is showing ${context.teamSnapshot.inboundWaiting} live inbound waiting, ${context.teamSnapshot.unreadItems} unread items, and a Retell mix of ${context.retell.voicemailCalls.length} voicemails vs ${context.retell.connectedCalls.length} connected calls. That's enough movement to focus Deric on response speed and callback discipline, not vanity reporting.`;
  } else if (normalized.includes('manager action') || normalized.includes('next action') || normalized.includes('what should')) {
    headline = 'Manager actions from the live state';
    summary = `The move is operational, not philosophical: clear the top inbound queues, stop unread buildup, and use recent Retell outcomes to coach callback discipline.`;
  } else if (normalized.includes('messiest') || normalized.includes('queue')) {
    headline = topRep ? `${topRep.name} has the messiest live queue` : headline;
    summary = topRep
      ? `${topRep.name} is carrying the worst queue mix right now. ${topRep.inboundWaiting} inbound waiting plus ${topRep.unread} unread is the ugliest combination in the snapshot.`
      : defaultSummary;
  } else if (normalized.includes('retell') || normalized.includes('coach') || normalized.includes('call')) {
    headline = 'Retell coaching read';
    summary = latestConnected
      ? `Start with connected calls, especially ${latestConnected.contact}. But the bigger pattern is ${context.retell.voicemailCalls.length} voicemail outcomes, which means callback process and retry timing deserve more attention than script tweaking.`
      : `The Retell lane is mostly showing non-connect outcomes. Focus on callback timing and list quality before deeper script work.`;
  }

  return {
    headline,
    summary,
    rankedPriorities: context.rankedPriorities,
    whoNeedsAttention: context.whoNeedsAttention,
    changes: context.changes,
    nextActions: context.nextActions,
  };
}

function renderCopilotResponse() {
  const response = state.copilotResponse;
  if (!response) return;

  els.copilotUpdatedAt.textContent = `Reasoned from live snapshot · ${fmtTs(state.data.generatedAt)}`;
  els.copilotOutput.innerHTML = `
    <div class="copilot-answer-card">
      <div class="label">Answer</div>
      <h3>${escapeHtml(response.headline)}</h3>
      <p class="copilot-summary">${escapeHtml(response.summary)}</p>
    </div>

    <div class="copilot-grid">
      <div class="copilot-section">
        <div class="label">Ranked priorities</div>
        ${response.rankedPriorities.map((item, index) => `
          <div class="copilot-list-item">
            <div class="item-row"><strong>${index + 1}. ${escapeHtml(item.title)}</strong><span class="priority-badge ${item.urgency}">${escapeHtml(item.urgency)}</span></div>
            <div class="item-meta">${escapeHtml(item.reason)}</div>
          </div>
        `).join('')}
      </div>

      <div class="copilot-section">
        <div class="label">Who needs attention</div>
        ${response.whoNeedsAttention.map(item => `
          <div class="copilot-list-item">
            <div class="item-row"><strong>${escapeHtml(item.name)}</strong></div>
            <div class="item-meta">${escapeHtml(item.reason)}</div>
            <div class="rep-note">${escapeHtml(item.nextMove)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="copilot-grid">
      <div class="copilot-section">
        <div class="label">What changed</div>
        ${response.changes.map(item => `<div class="copilot-list-item"><div class="item-meta">${escapeHtml(item)}</div></div>`).join('')}
      </div>
      <div class="copilot-section">
        <div class="label">Next actions</div>
        ${response.nextActions.map((item, index) => `<div class="copilot-list-item"><div class="item-meta"><strong>${index + 1}.</strong> ${escapeHtml(item)}</div></div>`).join('')}
      </div>
    </div>
  `;
}

function runCopilot(query) {
  if (!state.data) return;
  state.copilotQuery = query;
  const context = buildCopilotContext(state.data);
  state.copilotResponse = buildCopilotResponse(query, context);
  renderCopilotResponse();
}

window.runSuggestedPrompt = function(prompt) {
  els.copilotInput.value = prompt;
  runCopilot(prompt);
};

window.submitCopilotPrompt = function() {
  runCopilot(els.copilotInput.value);
};

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
    { label: 'Retell calls (36h)', value: snapshot.retellCalls36h ?? snapshot.retellCalls24h, sub: 'Manager review window' },
    { label: 'Voicemails', value: snapshot.retellVoicemails, sub: 'Recent no-connect pattern' },
    { label: 'Retell connects', value: snapshot.retellConnections, sub: 'Connected AI calls in sample' },
    { label: 'Review queue', value: snapshot.retellReviewCount ?? 0, sub: 'Calls worth manager eyes first' },
  ];

  els.kpiGrid.innerHTML = kpis.map(kpi => `
    <div class="kpi-card">
      <div class="label">${escapeHtml(kpi.label)}</div>
      <div class="kpi-value">${escapeHtml(kpi.value)}</div>
      <div class="kpi-sub">${escapeHtml(kpi.sub)}</div>
    </div>
  `).join('');

  const ranked = [...data.repCards].sort((a, b) => (b.inboundWaiting - a.inboundWaiting) || (b.stale - a.stale) || (b.unread - a.unread));
  els.repRanking.innerHTML = ranked.map((rep, index) => `
    <div class="rank-item ${rankingClass(index)}">
      <div class="item-row"><strong>#${index + 1} ${escapeHtml(rep.name)}</strong><strong>${escapeHtml(rep.inboundWaiting)} waiting</strong></div>
      <div class="item-meta">${escapeHtml(rep.needsAttentionReason)}</div>
    </div>
  `).join('');

  els.attentionList.innerHTML = data.needsAttention.map(item => `
    <div class="attention-item">
      <div class="item-row"><strong>${escapeHtml(item.title)}</strong></div>
      <div class="item-meta">${escapeHtml(item.note)}</div>
    </div>
  `).join('');

  els.repCards.innerHTML = data.repCards.map(rep => {
    const score = scoreForRep(rep);
    const escapedName = rep.name.replace(/'/g, "\\'");
    return `
      <div class="rep-card ${state.selectedRep === rep.name ? 'active' : ''}" onclick="selectRep('${escapedName}')">
        <div class="rep-card-header">
          <div>
            <div class="label">${rep.inboundWaiting > 0 ? 'Needs follow-up pressure relief' : rep.stale > 0 ? 'Queue getting stale' : 'Relatively clean queue'}</div>
            <h3>${escapeHtml(rep.name)}</h3>
          </div>
          <div class="score-badge ${scoreClass(score)}">${score}</div>
        </div>
        <div class="metrics-row">
          <div class="metric-box"><div class="label">Assigned</div><div class="num">${escapeHtml(rep.assigned)}</div></div>
          <div class="metric-box"><div class="label">Unread</div><div class="num">${escapeHtml(rep.unread)}</div></div>
          <div class="metric-box"><div class="label">Stale</div><div class="num">${escapeHtml(rep.stale)}</div></div>
        </div>
        <div class="rep-note">${escapeHtml(rep.needsAttentionReason)}</div>
      </div>
    `;
  }).join('');

  if (!state.selectedRep && data.repCards.length) state.selectedRep = data.repCards[0].name;
  renderRepDetail(data.repCards.find(r => r.name === state.selectedRep) || data.repCards[0]);

  els.managerActions.innerHTML = data.managerActions.map((action, idx) => `
    <div class="action-item"><div class="item-row"><strong>${idx + 1}. ${escapeHtml(action)}</strong></div></div>
  `).join('') + `
    <div class="action-item">
      <div class="item-row"><strong>Refresh cadence</strong></div>
      <div class="item-meta">Morning sync + manual trigger. Data file generated at ${fmtTs(data.generatedAt)}.</div>
    </div>`;

  els.confidenceBadge.className = `confidence ${data.confidence.level}`;
  els.confidenceBadge.textContent = data.confidence.label;
  els.confidenceText.textContent = data.confidence.text;

  renderRetellModule();

  if (!state.copilotResponse) {
    runCopilot('Who needs attention first right now based on unread inbound and stale conversations?');
  } else {
    renderCopilotResponse();
  }
}

function renderRepDetail(rep) {
  if (!rep) return;
  const data = state.data;
  const queue = data.recentQueue.filter(item => item.rep === rep.name).slice(0, 4);
  els.detailName.textContent = rep.name;
  els.repDetail.innerHTML = `
    <div class="detail-chip-row">
      <div class="chip">Assigned: ${escapeHtml(rep.assigned)}</div>
      <div class="chip">Unread: ${escapeHtml(rep.unread)}</div>
      <div class="chip">Inbound waiting: ${escapeHtml(rep.inboundWaiting)}</div>
      <div class="chip">Stale 48h+: ${escapeHtml(rep.stale)}</div>
    </div>
    <div class="coaching-box">
      <div class="label">Manager read</div>
      <p class="rep-note">${escapeHtml(rep.needsAttentionReason)}</p>
    </div>
    <div class="detail-section">
      <div class="label">Last touch</div>
      <p class="rep-note">${fmtTs(rep.lastTouchAt)}</p>
    </div>
    <div class="detail-section">
      <div class="label">Recent queue samples</div>
      ${queue.length ? queue.map(item => `<p class="rep-note">• ${escapeHtml(item.contactName)} — ${escapeHtml(item.direction || 'unknown')} / ${escapeHtml(item.type || 'unknown')} / unread ${escapeHtml(item.unread)} / ${fmtTs(item.lastTouchAt)}</p>`).join('') : '<p class="rep-note">No recent queue samples in the current fetch.</p>'}
    </div>
  `;
}

function renderRetellModule() {
  const module = state.data.retellModule;
  if (!module) return;
  els.retellMeta.textContent = `${module.lookbackHours}-hour lookback · ${module.refreshCadence}`;
  els.retellCards.innerHTML = module.cards.map(card => `
    <div class="metric-box">
      <div class="label">${escapeHtml(card.label)}</div>
      <div class="num">${escapeHtml(card.value)}</div>
      <div class="rep-note">${escapeHtml(card.subtext)}</div>
    </div>
  `).join('');

  if (!state.selectedRetellCallId && module.calls.length) state.selectedRetellCallId = module.calls[0].callId;
  els.retellCallList.innerHTML = module.calls.map(call => `
    <div class="retell-call-item ${state.selectedRetellCallId === call.callId ? 'active' : ''}" onclick="selectRetellCall('${call.callId}')">
      <div class="item-row"><strong>${escapeHtml(call.contact)}</strong><strong>${escapeHtml(call.status)}</strong></div>
      <div class="item-meta">${fmtTs(call.timestamp)} · ${escapeHtml(call.agentName)} · ${escapeHtml(call.durationSeconds || 0)}s</div>
      <div class="rep-note">${escapeHtml(call.managerRead)}</div>
    </div>
  `).join('');

  const selected = module.calls.find(call => call.callId === state.selectedRetellCallId) || module.calls[0];
  if (selected) renderRetellDetail(selected);
}

function renderRetellDetail(call) {
  els.retellDetailName.textContent = call.contact;
  els.retellDetail.innerHTML = `
    <div class="detail-chip-row">
      <div class="chip">${escapeHtml(call.status)}</div>
      <div class="chip">${escapeHtml(call.direction || 'unknown direction')}</div>
      <div class="chip">${escapeHtml(call.durationSeconds || 0)}s</div>
      <div class="chip">${fmtTs(call.timestamp)}</div>
    </div>
    <div class="coaching-box">
      <div class="label">Manager read</div>
      <p class="rep-note">${escapeHtml(call.managerRead)}</p>
    </div>
    <div class="detail-section">
      <div class="label">Call summary</div>
      <p class="rep-note">${escapeHtml(call.summary)}</p>
    </div>
    <div class="detail-section">
      <div class="label">Transcript snippet</div>
      <p class="rep-note">${escapeHtml(call.transcriptSnippet || 'No transcript snippet available.')}</p>
    </div>
    <div class="detail-section">
      <div class="label">Links</div>
      <p class="rep-note">${call.recordingUrl ? `<a href="${call.recordingUrl}" target="_blank" rel="noopener noreferrer">Open recording</a>` : 'No recording URL available.'}</p>
      <p class="rep-note">${call.recordingMultiChannelUrl ? `<a href="${call.recordingMultiChannelUrl}" target="_blank" rel="noopener noreferrer">Open multichannel audio</a>` : ''}</p>
    </div>
  `;
}

window.selectRep = function(name) {
  state.selectedRep = name;
  render();
};

window.selectRetellCall = function(callId) {
  state.selectedRetellCallId = callId;
  renderRetellModule();
};

async function boot() {
  renderPrompts();
  els.rangeButtons.innerHTML = '<div class="muted small">Live mode uses a synced data file instead of manual date-range toggles.</div>';
  els.copilotAskButton.addEventListener('click', () => runCopilot(els.copilotInput.value));
  els.copilotInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runCopilot(els.copilotInput.value);
    }
  });

  const res = await fetch('data/live-dashboard.json', { cache: 'no-store' });
  state.data = await res.json();
  render();
}

boot().catch(err => {
  console.error(err);
  els.kpiGrid.innerHTML = `<div class="panel"><h3>Could not load live data</h3><p class="rep-note">${escapeHtml(err.message)}</p></div>`;
});
