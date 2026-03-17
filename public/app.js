// ── State ────────────────────────────────────────────────────────────────────
let currentPage    = 1;
let currentFilter  = 'all';
let currentSearch  = '';
let logPaused      = false;
let activityChart  = null;
let statsData      = null;
let searchDebounce = null;

// Escape HTML utility to prevent XSS
const esc = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// ── Toaster ──────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
    setTimeout(() => container.removeChild(t), 300);
  }, 4000);
}

// ── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Hide loader immediately — sections load independently
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 400);

  // Load all panels
  loadStats();
  loadEmails(1);
  refreshLog();

  // Polling intervals
  setInterval(() => { loadStats(); refreshLog(); }, 60000);
  setInterval(refreshLog, 30000);
});

async function refreshAll() {
  const btn = document.getElementById('refreshBtn');
  if(btn) { btn.disabled = true; btn.innerHTML = '↻ Refreshing...'; }
  await loadStats();
  await loadEmails(currentPage);
  await refreshLog();
  const lu = document.getElementById('lastUpdated');
  if(lu) lu.textContent = 'Updated ' + new Date().toLocaleTimeString();
  if(btn) { btn.disabled = false; btn.innerHTML = '↻ Refresh'; }
}

// ── Stats ────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if(res.status === 401) { window.location.href='/'; return; }
    const data = await res.json();
    statsData = data;
    
    animateCounter('s-accountsToday', data.today.accounts);
    animateCounter('s-emailsToday',   data.today.emails);
    animateCounter('s-totalAccounts', data.totals.accounts);
    animateCounter('s-sent',          data.totals.sent);
    animateCounter('s-pending',       data.totals.pending);
    
    const accBrk = document.getElementById('s-accountsTodayBreak');
    if(accBrk) accBrk.textContent = `${data.today.ig.accounts.toLocaleString()} IG · ${data.today.tk.accounts.toLocaleString()} TikTok`;
    
    const emSub = document.getElementById('s-emailsTodaySub');
    if(emSub) emSub.textContent = data.today.accounts > 0
        ? `${((data.today.emails / data.today.accounts)*100).toFixed(0)}% hit rate today`
        : "of today's accounts";
        
    const sentSub = document.getElementById('s-sentSub');
    if(sentSub) sentSub.textContent = data.totals.emails > 0
        ? `${((data.totals.sent / data.totals.emails)*100).toFixed(1)}% of ${data.totals.emails.toLocaleString()} emails`
        : 'of total emails';
        
    const hr = document.getElementById('s-hitRate');
    if(hr) hr.textContent = `${data.totals.hitRate}% overall hit rate`;

    updateGoalRing(data.goal);
    renderChart(data.chart);
  } catch (e) {
    console.error('Stats error:', e);
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const dur = 800, step = 16;
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += step;
    const progress = Math.min(elapsed / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(start + (target - start) * eased);
    el.textContent = val.toLocaleString();
    if (progress >= 1) clearInterval(timer);
  }, step);
}

function updateGoalRing({ target, today, percent }) {
  const circumference = 427.26;
  const offset = circumference - (percent / 100) * circumference;
  const fg = document.getElementById('goalRingFg');
  if(!fg) return;
  
  fg.style.strokeDashoffset = offset;

  // Color by progress (Tailwind colors)
  if (percent >= 80) {
    fg.style.stroke = 'var(--brand-emerald)';
  } else if (percent >= 50) {
    fg.style.stroke = 'url(#ringGrad)';
  } else {
    fg.style.stroke = 'var(--brand-amber)';
  }

  document.getElementById('goalPct').textContent = percent + '%';
  document.getElementById('goalNum').textContent  = today.toLocaleString() + ' / ' + target.toLocaleString();

  // ETA calculation
  const now = new Date();
  const hoursLeft = 24 - now.getHours() - now.getMinutes() / 60;
  const hoursElapsed = now.getHours() + now.getMinutes() / 60;
  const etaEl = document.getElementById('goalEta');
  if (!etaEl) return;
  
  if (today >= target) {
    etaEl.innerHTML = '<strong style="color:var(--brand-emerald)">🎉 Goal reached!</strong>';
  } else if (hoursElapsed > 0) {
    const rate = today / hoursElapsed;
    if (rate > 0) {
      const needed = target - today;
      const hoursNeeded = needed / rate;
      const eta = new Date(Date.now() + hoursNeeded * 3600000);
      etaEl.innerHTML = `~${Math.round(rate)}/hr · ETA <strong>${eta.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</strong>`;
    } else {
      etaEl.innerHTML = 'Scraper not active';
    }
  } else {
    etaEl.innerHTML = 'No data yet today';
  }
}

// ── Chart ─────────────────────────────────────────────────────────────────────
function renderChart(chartData) {
  const cnvs = document.getElementById('activityChart');
  if(!cnvs) return;
  const ctx = cnvs.getContext('2d');
  
  const labels    = chartData.map(d => d.label);
  const accounts  = chartData.map(d => d.igAccounts + d.tkAccounts);
  const emailsArr = chartData.map(d => d.igEmails   + d.tkEmails);

  if (activityChart) { activityChart.destroy(); }

  Chart.defaults.color = '#71717a';
  Chart.defaults.font.family = 'Inter';

  activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Accounts Scraped',
          data: accounts,
          backgroundColor: 'rgba(79, 70, 229, 0.2)', // Indigo light match
          borderColor: '#4f46e5',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Emails Found',
          data: emailsArr,
          backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald match
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: { color: '#a1a1aa', font: { family: 'Inter', size: 12 }, boxWidth: 12, boxHeight: 12 }
        },
        tooltip: {
          backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1, titleColor: '#fafafa', bodyColor: '#a1a1aa',
          padding: 12, cornerRadius: 8,
          callbacks: {
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              const d   = chartData[idx];
              return [`IG: ${d.igAccounts.toLocaleString()} accts / ${d.igEmails.toLocaleString()} emails`,
                      `TK: ${d.tkAccounts.toLocaleString()} accts / ${d.tkEmails.toLocaleString()} emails`];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
      }
    }
  });

  // Target line plugin
  const targetPlugin = {
    id: 'targetLine',
    afterDraw(chart) {
      const { ctx, scales: { y } } = chart;
      const yVal = 1500;
      if (yVal < y.min || yVal > y.max) return;
      const yPos = y.getPixelForValue(yVal);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(chart.chartArea.left, yPos);
      ctx.lineTo(chart.chartArea.right, yPos);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.font = '10px Inter';
      ctx.fillText('Target 1,500', chart.chartArea.right - 70, yPos - 5);
      ctx.restore();
    }
  };
  activityChart.config.plugins.push(targetPlugin);
  activityChart.update();
}

// ── Email Table ───────────────────────────────────────────────────────────────
async function loadEmails(page = 1) {
  currentPage = page;
  const params = new URLSearchParams({ page, status: currentFilter, q: currentSearch });
  try {
    const data = await fetch(`/api/emails?${params}`).then(r => r.json());
    renderTable(data);
  } catch (e) {
    console.error('Emails error:', e);
  }
}

function renderTable({ total, page, limit, rows }) {
  const tbody = document.getElementById('emailTableBody');
  if(!tbody) return;
  
  const tc = document.getElementById('tableCount');
  if(tc) tc.textContent = `${total.toLocaleString()} results`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No emails found match your criteria</td></tr>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const platform = r.platform === 'Instagram'
      ? '<span class="badge info">IG</span>'
      : '<span class="badge" style="background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2)">TK</span>';
    const status = r.status === 'sent'
      ? '<span class="badge success"><span style="width:6px;height:6px;border-radius:50%;background:currentColor"></span> Sent</span>'
      : '<span class="badge warning"><span style="width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s infinite"></span> Pending</span>';
    
    const action = r.status === 'sent'
      ? `<button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="markUnsent('${esc(r.email)}', this)">Undo</button>`
      : `<button class="btn btn-secondary" style="padding:4px 8px;font-size:11px;color:var(--brand-emerald-l);border-color:rgba(16,185,129,0.3)" onclick="markSent('${esc(r.email)}', '${esc(r.username)}', this)">Mark Sent</button>`;
      
    const date = r.scrapedAt ? new Date(r.scrapedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '–';
    const followers = r.followers ? parseInt(r.followers).toLocaleString() : '–';
    
    return `
      <tr>
        <td>${platform}</td>
        <td style="font-weight:600;"><a href="${esc(r.profileUrl)}" target="_blank" style="color:inherit;text-decoration:none">@${esc(r.username)}</a></td>
        <td class="font-mono" style="font-size:12px;color:var(--text-muted)">${esc(r.email)}</td>
        <td style="color:var(--text-dark)">${followers}</td>
        <td style="color:var(--text-dark)">${date}</td>
        <td>${status}</td>
        <td>${action}</td>
      </tr>`;
  }).join('');

  // Pagination
  const totalPages = Math.ceil(total / limit);
  renderPagination(page, totalPages, total);
}

function renderPagination(page, totalPages, total) {
  const pg = document.getElementById('pagination');
  if (!pg) return;
  if (totalPages <= 1) { pg.innerHTML = ''; return; }

  const pages = [];
  const range = 2;
  for (let p = Math.max(1, page - range); p <= Math.min(totalPages, page + range); p++) pages.push(p);

  let html = `
    <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-top:20px;">
    <button class="btn btn-secondary" onclick="loadEmails(${page - 1})" ${page <= 1 ? 'disabled' : ''}>Prev</button>
  `;
  
  if(pages[0] > 1) {
    html += `<button class="btn btn-secondary" onclick="loadEmails(1)">1</button>`;
    if(pages[0] > 2) html += `<span style="color:var(--text-muted)">…</span>`;
  }
  
  pages.forEach(p => {
    html += `<button class="btn btn-secondary ${p === page ? 'active' : ''}" onclick="loadEmails(${p})">${p}</button>`;
  });
  
  if(pages[pages.length-1] < totalPages) {
    if(pages[pages.length-1] < totalPages - 1) html += `<span style="color:var(--text-muted)">…</span>`;
    html += `<button class="btn btn-secondary" onclick="loadEmails(${totalPages})">${totalPages}</button>`;
  }
  
  html += `
    <button class="btn btn-secondary" onclick="loadEmails(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>Next</button>
    <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${total.toLocaleString()} total</span>
    </div>
  `;
  pg.innerHTML = html;
}

window.setFilter = function(f) {
  currentFilter = f; currentPage = 1;
  ['all','pending','sent'].forEach(id => {
    const btn = document.getElementById(`btn-${id}`);
    if(btn) {
      if(id === f) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  loadEmails(1);
}

window.onSearch = function() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = document.getElementById('emailSearch').value.trim();
    loadEmails(1);
  }, 350);
}

window.markSent = async function(email, username, btn) {
  if(btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await fetch('/api/mark-sent', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, username }) });
    showToast('Marked as sent: ' + email, 'success');
    await loadEmails(currentPage);
  } catch { 
    showToast('Error marking sent', 'error'); 
    if(btn) { btn.disabled = false; btn.textContent = 'Mark Sent'; } 
  }
}

window.markUnsent = async function(email, btn) {
  if(btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await fetch('/api/mark-unsent', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    showToast('Reverted to pending: ' + email, 'info');
    await loadEmails(currentPage);
  } catch { 
    showToast('Error reverting', 'error'); 
    if(btn) { btn.disabled = false; btn.textContent = 'Undo'; } 
  }
}

// ── Log ───────────────────────────────────────────────────────────────────────
window.togglePause = function() {
  logPaused = !logPaused;
  const btn = document.getElementById('pauseBtn');
  if(btn) {
    btn.textContent = logPaused ? '▶ Resume' : '⏸ Pause';
    btn.classList.toggle('active', logPaused);
  }
  if (!logPaused) refreshLog();
}

async function refreshLog() {
  if (logPaused) return;
  try {
    const term = document.getElementById('logTerminal');
    if(!term) return;
    
    // We fetch from cloud/log for general activity as that's the primary engine in index.html,
    // though ideally we fetch a combined log
    const data = await fetch('/api/cloud/log').then(r => r.json());
    if (data.lines && data.lines.length > 0) {
      // Very basic ANSI to HTML parsing
      const html = data.lines.map(line => {
        let escLine = esc(line);
        // Simple color mappings
        escLine = escLine.replace(/\[32m(.*?)\[39m/g, '<span style="color:var(--brand-emerald-l)">$1</span>');
        escLine = escLine.replace(/\[31m(.*?)\[39m/g, '<span style="color:var(--brand-rose)">$1</span>');
        escLine = escLine.replace(/\[33m(.*?)\[39m/g, '<span style="color:var(--brand-amber)">$1</span>');
        escLine = escLine.replace(/\[36m(.*?)\[39m/g, '<span style="color:var(--brand-cyan)">$1</span>');
        escLine = escLine.replace(/\[90m(.*?)\[39m/g, '<span style="color:var(--text-dark)">$1</span>');
        return `<div class="log-line">${escLine}</div>`;
      }).join('');
      
      const isScrolledToBottom = term.scrollHeight - term.clientHeight <= term.scrollTop + 20;
      term.innerHTML = html;
      if (isScrolledToBottom) {
        term.scrollTop = term.scrollHeight;
      }
    }
  } catch (e) {
    // console.error('Log error:', e);
  }
}
