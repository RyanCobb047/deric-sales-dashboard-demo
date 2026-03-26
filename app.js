const dashboardData = {
  today: {
    confidence: { level: 'high', label: 'High confidence', text: 'Demo data is complete for the selected mock range. In production this would be sourced from GHL activity, opportunity, and task records.' },
    kpis: [
      { label: 'Calls', value: 284, sub: '+11% vs yesterday' },
      { label: 'Conversations', value: 63, sub: '22.2% connect rate' },
      { label: 'Appointments', value: 9, sub: '3 qualified opps already tagged' },
      { label: 'Follow-ups missed', value: 14, sub: 'Main leak in the floor right now' }
    ],
    ranking: [
      { name: 'Morgan', score: 92, reason: 'Best mix of connects, follow-up discipline, and pipeline created.' },
      { name: 'Jayson', score: 88, reason: 'Heavy volume and solid connects, but one follow-up lagging.' },
      { name: 'Nate', score: 79, reason: 'Appointment output is good, call quality still uneven.' },
      { name: 'Mark', score: 73, reason: 'Busy enough, but not converting activity into real conversations.' },
      { name: 'Brendon', score: 67, reason: 'Follow-up misses are dragging an otherwise average day.' },
      { name: 'Derek', score: 58, reason: 'Lowest activity and weakest pipeline movement on the board.' }
    ],
    attention: [
      { title: 'Derek has only 21 calls by midday', note: 'Volume is materially under team pace. Needs a floor check now.' },
      { title: 'Brendon missed 5 scheduled follow-ups', note: 'Leads are being touched late. This is preventable pipeline rot.' },
      { title: 'Mark’s average call length is 1m 11s', note: 'He is dialing, but not holding real conversations.' },
      { title: '14 overdue lead tasks', note: 'Manager should treat this as the team’s biggest operational leak.' }
    ],
    actions: [
      'Pull Derek aside and reset activity target for the next 2 hours.',
      'Audit Brendon’s overdue follow-up queue live and clear the oldest leads first.',
      'Listen to 3 of Mark’s calls. Coach opening, pace, and objection hold time.',
      'Have Morgan post today’s working follow-up language in the rep chat.',
      'Run a same-day stale lead sweep before close to stop overnight slippage.'
    ],
    reps: [
      {
        name: 'Jayson', score: 88, calls: 57, connects: 14, connectRate: '24.6%', appts: 2, opps: 1, overdue: 1,
        trend: 'up', note: 'Strong motor today. Small follow-up discipline gap.',
        quality: 'Good talk time, strong opener consistency.',
        coaching: 'Tighten same-day follow-up speed. He is earning enough attention to squeeze more opp creation from the same activity.',
        details: ['Avg call length: 3m 42s', 'Pipeline created: $64k', 'Lead speed-to-contact: 18 min', 'Best source: aged leads reactivation']
      },
      {
        name: 'Morgan', score: 92, calls: 49, connects: 15, connectRate: '30.6%', appts: 3, opps: 2, overdue: 0,
        trend: 'up', note: 'Best operator on the floor today.',
        quality: 'Balanced rep: volume, quality, and follow-through all show up.',
        coaching: 'Use Morgan as the model rep. Pull exact language and sequencing for team coaching.',
        details: ['Avg call length: 4m 08s', 'Pipeline created: $91k', 'Lead speed-to-contact: 9 min', 'Best source: fresh inbound web leads']
      },
      {
        name: 'Nate', score: 79, calls: 46, connects: 10, connectRate: '21.7%', appts: 2, opps: 1, overdue: 2,
        trend: 'flat', note: 'Useful day, but a bit choppy.',
        quality: 'Output is okay. Consistency is not.',
        coaching: 'Work on first 30 seconds and cleaner disposition habits. He is close to a stronger day than the raw score suggests.',
        details: ['Avg call length: 2m 54s', 'Pipeline created: $48k', 'Lead speed-to-contact: 27 min', 'Best source: old nurture re-engagement']
      },
      {
        name: 'Mark', score: 73, calls: 61, connects: 11, connectRate: '18.0%', appts: 1, opps: 0, overdue: 3,
        trend: 'down', note: 'Looks active. Not actually winning enough.',
        quality: 'Volume without enough substance.',
        coaching: 'Coach tonality and staying power. His calls are ending too fast to produce opportunities.',
        details: ['Avg call length: 1m 11s', 'Pipeline created: $18k', 'Lead speed-to-contact: 31 min', 'Best source: outbound refi list']
      },
      {
        name: 'Brendon', score: 67, calls: 50, connects: 8, connectRate: '16.0%', appts: 1, opps: 0, overdue: 5,
        trend: 'down', note: 'Follow-up discipline is hurting him badly.',
        quality: 'The problem is not only calls. It is lead handling after the call.',
        coaching: 'Reset his task hygiene. He needs a tighter process for next-step commitments and callback timing.',
        details: ['Avg call length: 2m 03s', 'Pipeline created: $15k', 'Lead speed-to-contact: 42 min', 'Best source: self-gen callbacks']
      },
      {
        name: 'Derek', score: 58, calls: 21, connects: 5, connectRate: '23.8%', appts: 0, opps: 0, overdue: 3,
        trend: 'down', note: 'Not enough activity to stay in the game.',
        quality: 'Connect rate is not terrible. The issue is pace and urgency.',
        coaching: 'This is a manager intervention case, not a dashboard curiosity. Reset standards live today.',
        details: ['Avg call length: 2m 38s', 'Pipeline created: $0', 'Lead speed-to-contact: 56 min', 'Best source: none standing out']
      }
    ]
  },
  yesterday: {
    confidence: { level: 'partial', label: 'Partial data', text: 'Demo scenario: several dispositions landed late, so yesterday is directionally useful but not final.' },
    kpis: [
      { label: 'Calls', value: 251, sub: 'Softer pace than today' },
      { label: 'Conversations', value: 55, sub: '21.9% connect rate' },
      { label: 'Appointments', value: 7, sub: 'Morgan led again' },
      { label: 'Follow-ups missed', value: 18, sub: 'Task discipline slipped' }
    ],
    ranking: [
      { name: 'Morgan', score: 90, reason: 'Still the most complete day on the floor.' },
      { name: 'Jayson', score: 84, reason: 'Volume was there, conversion slightly softer.' },
      { name: 'Mark', score: 76, reason: 'Better than today, but still light on quality.' },
      { name: 'Nate', score: 74, reason: 'Middle-of-the-pack across the board.' },
      { name: 'Brendon', score: 63, reason: 'Too many loose ends in tasks and callbacks.' },
      { name: 'Derek', score: 60, reason: 'Same issue: not enough urgency.' }
    ],
    attention: [
      { title: '18 missed follow-ups', note: 'Yesterday’s carryover explains part of today’s mess.' },
      { title: 'Brendon callback queue bloated', note: 'Needs structure, not just pressure.' },
      { title: 'Mark’s connects didn’t convert', note: 'Conversation quality issue, not list issue.' }
    ],
    actions: [
      'Review yesterday’s overdue tasks before assigning blame for today.',
      'Coach callback handling with Brendon and Mark together.',
      'Push Morgan’s workflow as the team baseline.',
      'Create a noon and 4pm follow-up hygiene checkpoint.'
    ],
    reps: []
  },
  '7d': {
    confidence: { level: 'high', label: 'High confidence', text: 'Demo weekly rollup includes enough sample activity to compare consistency and trend line.' },
    kpis: [
      { label: 'Calls', value: 1418, sub: 'Team avg 236/day' },
      { label: 'Conversations', value: 311, sub: '21.9% connect rate' },
      { label: 'Appointments', value: 42, sub: '8 from Morgan, 8 from Jayson' },
      { label: 'Follow-ups missed', value: 71, sub: 'Biggest weekly process leak' }
    ],
    ranking: [
      { name: 'Morgan', score: 93, reason: 'Most consistent producer over the week.' },
      { name: 'Jayson', score: 89, reason: 'Reliable pressure and healthy pipeline.' },
      { name: 'Nate', score: 80, reason: 'Solid week with room to tighten process.' },
      { name: 'Mark', score: 72, reason: 'Activity is acceptable, outcomes lag.' },
      { name: 'Brendon', score: 66, reason: 'Too much leakage in follow-up and conversions.' },
      { name: 'Derek', score: 57, reason: 'Lowest consistency and weakest urgency trend.' }
    ],
    attention: [
      { title: '71 missed follow-ups in 7 days', note: 'This is a management system problem, not an individual fluke.' },
      { title: 'Derek’s weekly pace is 38% below team avg', note: 'He is not carrying his share of reps.' },
      { title: 'Mark’s talk time remains thin', note: 'Needs call coaching before more list changes.' }
    ],
    actions: [
      'Run a weekly rep scorecard review with all six reps side by side.',
      'Install mandatory follow-up checkpoints twice daily.',
      'Pair Mark with Morgan for call shadowing.',
      'Put Derek on a visible hourly activity target next week.'
    ],
    reps: []
  },
  '30d': {
    confidence: { level: 'partial', label: 'Partial data', text: 'Demo monthly view suggests reliable trend direction, but some older task outcomes are assumed rather than fully reconciled.' },
    kpis: [
      { label: 'Calls', value: 5862, sub: 'Rep avg 977/month' },
      { label: 'Conversations', value: 1264, sub: '21.6% connect rate' },
      { label: 'Appointments', value: 171, sub: 'Morgan remains #1 overall' },
      { label: 'Follow-ups missed', value: 287, sub: 'Persistent operational drag' }
    ],
    ranking: [
      { name: 'Morgan', score: 94, reason: 'Best month by balanced scorecard, not just call count.' },
      { name: 'Jayson', score: 87, reason: 'Strong production with minor discipline gaps.' },
      { name: 'Nate', score: 78, reason: 'Middle performer with some upside.' },
      { name: 'Mark', score: 70, reason: 'Lots of dialing, not enough real wins.' },
      { name: 'Brendon', score: 65, reason: 'Too many dropped balls after first touch.' },
      { name: 'Derek', score: 54, reason: 'Needs a managerial reset, not just encouragement.' }
    ],
    attention: [
      { title: '287 missed follow-ups this month', note: 'This is systemic and expensive.' },
      { title: 'Morgan vs bottom reps gap is widening', note: 'Top-end behavior exists; team adoption does not.' },
      { title: 'Derek remains bottom two in every major category', note: 'You need a decision, not another soft reminder.' }
    ],
    actions: [
      'Use the month view for performance accountability, not same-day coaching.',
      'Build a formal rep scorecard that punishes overdue follow-ups.',
      'Set intervention thresholds for pace, connect quality, and task hygiene.',
      'Review whether Derek’s role fit or standards need to change.'
    ],
    reps: []
  }
};

const prompts = [
  'Give me the real team snapshot for today and rank the reps.',
  'Who needs manager intervention first right now, and why?',
  'Show missed follow-ups and stale leads by rep.',
  'Give me 5 coaching actions for Deric before lunch.',
  'Compare today vs 7-day baseline and tell me what changed.'
];

let currentRange = 'today';
let selectedRep = 'Morgan';

const els = {
  headerRange: document.getElementById('headerRange'),
  kpiGrid: document.getElementById('kpiGrid'),
  repRanking: document.getElementById('repRanking'),
  attentionList: document.getElementById('attentionList'),
  repCards: document.getElementById('repCards'),
  repDetail: document.getElementById('repDetail'),
  detailName: document.getElementById('detailName'),
  managerActions: document.getElementById('managerActions'),
  rangeButtons: document.getElementById('rangeButtons'),
  confidenceBadge: document.getElementById('confidenceBadge'),
  confidenceText: document.getElementById('confidenceText'),
  promptList: document.getElementById('promptList')
};

function scoreClass(score) {
  if (score >= 85) return 'score-high';
  if (score >= 70) return 'score-mid';
  return 'score-low';
}

function rankingClass(index) {
  if (index < 2) return 'rank-top';
  if (index < 4) return 'rank-mid';
  return 'rank-low';
}

function prettyRange(range) {
  return ({ today: 'Today', yesterday: 'Yesterday', '7d': 'Last 7 Days', '30d': 'Last 30 Days' })[range] || range;
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
  const data = dashboardData[currentRange];
  els.headerRange.textContent = prettyRange(currentRange);
  els.kpiGrid.innerHTML = data.kpis.map(kpi => `
    <div class="kpi-card">
      <div class="label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
      <div class="kpi-sub">${kpi.sub}</div>
    </div>
  `).join('');

  els.repRanking.innerHTML = data.ranking.map((rep, index) => `
    <div class="rank-item ${rankingClass(index)}">
      <div class="item-row"><strong>#${index + 1} ${rep.name}</strong><strong>${rep.score}</strong></div>
      <div class="item-meta">${rep.reason}</div>
    </div>
  `).join('');

  els.attentionList.innerHTML = data.attention.map(item => `
    <div class="attention-item">
      <div class="item-row"><strong>${item.title}</strong></div>
      <div class="item-meta">${item.note}</div>
    </div>
  `).join('');

  const reps = data.reps.length ? data.reps : dashboardData.today.reps;
  els.repCards.innerHTML = reps.map(rep => `
    <div class="rep-card ${selectedRep === rep.name ? 'active' : ''}" onclick="selectRep('${rep.name.replace(/'/g, "\\'")}')">
      <div class="rep-card-header">
        <div>
          <div class="label">${rep.trend === 'up' ? 'Trending up' : rep.trend === 'down' ? 'Needs intervention' : 'Steady'}</div>
          <h3>${rep.name}</h3>
        </div>
        <div class="score-badge ${scoreClass(rep.score)}">${rep.score}</div>
      </div>
      <div class="metrics-row">
        <div class="metric-box"><div class="label">Calls</div><div class="num">${rep.calls}</div></div>
        <div class="metric-box"><div class="label">Connects</div><div class="num">${rep.connects}</div></div>
        <div class="metric-box"><div class="label">Appts</div><div class="num">${rep.appts}</div></div>
      </div>
      <div class="rep-note">${rep.note}</div>
    </div>
  `).join('');

  const rep = reps.find(r => r.name === selectedRep) || reps[0];
  selectedRep = rep.name;
  renderRepDetail(rep);

  els.managerActions.innerHTML = data.actions.map((action, idx) => `
    <div class="action-item">
      <div class="item-row"><strong>${idx + 1}. ${action}</strong></div>
    </div>
  `).join('');

  els.confidenceBadge.className = `confidence ${data.confidence.level}`;
  els.confidenceBadge.textContent = data.confidence.label;
  els.confidenceText.textContent = data.confidence.text;

  document.querySelectorAll('#rangeButtons .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === currentRange);
  });
}

function renderRepDetail(rep) {
  els.detailName.textContent = rep.name;
  els.repDetail.innerHTML = `
    <div class="detail-chip-row">
      <div class="chip">Connect rate: ${rep.connectRate}</div>
      <div class="chip">Qualified opps: ${rep.opps}</div>
      <div class="chip">Overdue follow-ups: ${rep.overdue}</div>
    </div>
    <div class="detail-section">
      <div class="label">Quality read</div>
      <p class="rep-note">${rep.quality}</p>
    </div>
    <div class="detail-section">
      <div class="label">What the numbers mean</div>
      <p class="rep-note">${rep.note}</p>
    </div>
    <div class="coaching-box">
      <div class="label">Coaching note for Deric</div>
      <p class="rep-note">${rep.coaching}</p>
    </div>
    <div class="detail-section">
      <div class="label">Operational detail</div>
      ${rep.details.map(line => `<p class="rep-note">• ${line}</p>`).join('')}
    </div>
  `;
}

window.selectRep = function(name) {
  selectedRep = name;
  render();
}

els.rangeButtons.addEventListener('click', (event) => {
  const button = event.target.closest('[data-range]');
  if (!button) return;
  currentRange = button.dataset.range;
  render();
});

renderPrompts();
render();
