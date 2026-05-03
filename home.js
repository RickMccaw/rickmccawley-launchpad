/* ===========================================================
   home.js — AITV LIVE countdown + iOS-style May 2026 calendar
   Live Broadcast: every Thursday 8:00–10:00 PM EST (recurring)
   =========================================================== */

(function () {
  "use strict";

  /* ---------- US Eastern timezone helpers ---------- */
  // Returns the UTC offset (in hours, negative number) for America/New_York
  // at a given UTC date. EST = -5, EDT = -4.
  function easternOffsetHours(utcDate) {
    // Use Intl.DateTimeFormat to read the wall-clock hour in NY for this UTC moment.
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(utcDate).reduce((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
    // Wall-clock NY time as if it were UTC:
    const asUTC = Date.UTC(
      +parts.year, +parts.month - 1, +parts.day,
      +parts.hour, +parts.minute, +parts.second
    );
    // Difference (NY wall clock) - (real UTC) in hours
    return Math.round((asUTC - utcDate.getTime()) / 3600000);
  }

  // Build a UTC Date for a given Eastern wall-clock moment (Y-M-D H:M).
  function easternToUTC(year, month /*1-12*/, day, hour, minute) {
    // Try EST first (-5); compute candidate; if NY actually says EDT for that
    // moment, recompute with -4. This is enough for ±1 DST rule.
    let utc = Date.UTC(year, month - 1, day, hour - (-5), minute);
    let off = easternOffsetHours(new Date(utc));
    if (off !== -5) {
      utc = Date.UTC(year, month - 1, day, hour - off, minute);
    }
    return new Date(utc);
  }

  // Get Y-M-D-H-M of "now" in Eastern time (as a plain object).
  function easternParts(date) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      weekday: "short", hour12: false,
    });
    const parts = fmt.formatToParts(date).reduce((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
    return {
      year: +parts.year,
      month: +parts.month,
      day: +parts.day,
      hour: +parts.hour,
      minute: +parts.minute,
      second: +parts.second,
      weekday: parts.weekday, // "Mon", "Tue", "Wed", "Thu", ...
    };
  }

  /* ---------- Next Thursday 8pm EST resolver (recurring) ---------- */
  // Returns { startUTC, endUTC, isLiveNow } for the most relevant broadcast.
  function nextBroadcast(now) {
    const eNow = easternParts(now);
    // 0=Sun,1=Mon,...,4=Thu
    const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const todayDow = dowMap[eNow.weekday];

    // Days until Thursday (4). If today is Thursday, daysUntil=0.
    let daysUntil = (4 - todayDow + 7) % 7;

    // Build today's broadcast window (in Eastern wall-clock days):
    // baseDate = today's Eastern Y-M-D, then add daysUntil days.
    const targetEasternDate = new Date(Date.UTC(eNow.year, eNow.month - 1, eNow.day));
    targetEasternDate.setUTCDate(targetEasternDate.getUTCDate() + daysUntil);

    let y = targetEasternDate.getUTCFullYear();
    let m = targetEasternDate.getUTCMonth() + 1;
    let d = targetEasternDate.getUTCDate();

    let startUTC = easternToUTC(y, m, d, 20, 0); // 8 PM ET
    let endUTC   = easternToUTC(y, m, d, 22, 0); // 10 PM ET

    // If today is Thursday and we've already passed 10pm ET, advance 7 days.
    if (now >= endUTC) {
      const nextDate = new Date(Date.UTC(y, m - 1, d));
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      y = nextDate.getUTCFullYear();
      m = nextDate.getUTCMonth() + 1;
      d = nextDate.getUTCDate();
      startUTC = easternToUTC(y, m, d, 20, 0);
      endUTC   = easternToUTC(y, m, d, 22, 0);
    }

    const isLiveNow = now >= startUTC && now < endUTC;
    return { startUTC, endUTC, isLiveNow };
  }

  /* ---------- Format helpers ---------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function formatLiveWhen(startUTC) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZoneName: "short",
    });
    return fmt.format(startUTC);
  }

  /* ---------- Countdown UI ---------- */
  const card     = document.getElementById("liveCard");
  const pulse    = document.getElementById("livePulse");
  const labelEl  = document.getElementById("liveLabel");
  const whenEl   = document.getElementById("liveWhen");
  const cdDays   = document.getElementById("cdDays");
  const cdHours  = document.getElementById("cdHours");
  const cdMin    = document.getElementById("cdMin");
  const cdSec    = document.getElementById("cdSec");

  function tick() {
    if (!card) return;
    const now = new Date();
    const { startUTC, endUTC, isLiveNow } = nextBroadcast(now);

    if (isLiveNow) {
      card.classList.add("live-now");
      if (labelEl) labelEl.textContent = "LIVE NOW";
      if (whenEl)  whenEl.textContent  = "On air now — every Thursday 8–10 PM EST.";
      const remaining = endUTC - now;
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      if (cdDays)  cdDays.textContent  = "0";
      if (cdHours) cdHours.textContent = pad(h);
      if (cdMin)   cdMin.textContent   = pad(m);
      if (cdSec)   cdSec.textContent   = pad(s);
    } else {
      card.classList.remove("live-now");
      if (labelEl) labelEl.textContent = "UPCOMING LIVE";
      if (whenEl)  whenEl.textContent  = "Next broadcast: " + formatLiveWhen(startUTC);
      const diff = startUTC - now;
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const secs  = Math.floor((diff % 60000) / 1000);
      if (cdDays)  cdDays.textContent  = String(days);
      if (cdHours) cdHours.textContent = pad(hours);
      if (cdMin)   cdMin.textContent   = pad(mins);
      if (cdSec)   cdSec.textContent   = pad(secs);
    }
  }

  if (card) {
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- iOS-style May 2026 calendar ---------- */
  // Event days in May 2026 (matching the user's reference + every Thursday LIVE).
  // Thursdays in May 2026: 7, 14, 21, 28 (red dots = AITV LIVE)
  // Other events: 1 (graduation), 4-8, 11, 13, 15-16, 18, 20, 22, 25, 27, 29 (gold dots)
  const eventDays = new Set([1, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 18, 20, 21, 22, 25, 27, 28, 29]);
  const thursdays  = new Set([7, 14, 21, 28]);
  const todayET    = easternParts(new Date());
  // Highlight "today" only when the visible month matches.
  const showToday  = todayET.year === 2026 && todayET.month === 5;

  function renderMay2026() {
    const grid = document.getElementById("calGrid");
    if (!grid) return;

    // Day-of-week header
    const dow = ["S","M","T","W","T","F","S"];
    let html = "";
    dow.forEach(d => { html += '<div class="cal-dow">' + d + '</div>'; });

    // May 1, 2026 is a Friday → leading blanks: Sun(0)..Thu(4) = 5 cells
    const firstDow = new Date(Date.UTC(2026, 4, 1)).getUTCDay(); // 5 (Fri)
    const daysInMonth = 31;

    // April leading muted days: 26, 27, 28, 29, 30 (5 cells before May 1)
    const aprStart = 26;
    for (let i = 0; i < firstDow; i++) {
      html += '<div class="cal-day muted">' + (aprStart + i) + '</div>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cls = ["cal-day"];
      if (eventDays.has(d)) cls.push("has-event");
      if (thursdays.has(d)) cls.push("thu");
      if (showToday && d === todayET.day) cls.push("today");
      html += '<div class="' + cls.join(" ") + '">' + d + '</div>';
    }
    // Fill trailing cells to keep a 6-row grid (42 cells total) — optional.
    const used = firstDow + daysInMonth;
    const trailing = (7 - (used % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
      html += '<div class="cal-day muted">' + i + '</div>';
    }
    grid.innerHTML = html;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMay2026);
  } else {
    renderMay2026();
  }
})();
