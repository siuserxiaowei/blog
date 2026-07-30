#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import {
  competitions,
  getPrimaryDeadline,
  parseCompetitionDate,
} from '../src/data/competitions.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(value) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
      ) {
        throw new Error(`Invalid date: ${value}`);
      }
      return date;
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatLocalDate(value) {
  const date = startOfLocalDay(value);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(from, to) {
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / DAY_MS);
}

function addReason(reasons, code, score, detail) {
  reasons.push({ code, score, detail });
}

function priorityFor(score) {
  if (score >= 70) return 'critical';
  if (score >= 40) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

export function reviewCompetition(competition, options = {}) {
  const today = startOfLocalDay(options.today ?? new Date());
  const urgentDays = options.urgentDays ?? 14;
  const staleDays = options.staleDays ?? 30;
  const primary = getPrimaryDeadline(competition) ?? {};
  const verification = competition.verification ?? {};
  const reasons = [];
  const deadlineDate = parseCompetitionDate(primary.date);
  const daysToDeadline = deadlineDate ? daysBetween(today, deadlineDate) : null;
  const status = verification.status ?? 'unverified';
  const linkHealth = verification.linkHealth ?? 'unchecked';

  if (linkHealth === 'dead') {
    addReason(reasons, 'dead-source-or-action', 80, '原始来源或行动入口已确认失效');
  } else if (['uncertain', 'degraded'].includes(linkHealth)) {
    addReason(reasons, 'uncertain-link-health', 30, `链接状态：${linkHealth}`);
  } else if (linkHealth === 'unchecked') {
    addReason(reasons, 'unchecked-link-health', 10, '尚未运行链接健康复核');
  }

  if (
    primary.certainty === 'confirmed'
    && daysToDeadline !== null
    && daysToDeadline >= 0
    && daysToDeadline <= urgentDays
  ) {
    if (status === 'unverified') {
      addReason(reasons, 'urgent-unverified', 60, `${daysToDeadline} 天内截止但尚未完成事实核验`);
    } else if (status === 'partially-verified') {
      addReason(reasons, 'urgent-partially-verified', 45, `${daysToDeadline} 天内截止但仅部分核验`);
    }
  }

  if (primary.certainty === 'confirmed' && daysToDeadline !== null && daysToDeadline < 0) {
    addReason(reasons, 'confirmed-deadline-passed', 35, `确认截止日已过去 ${Math.abs(daysToDeadline)} 天`);
  }

  if (['estimated', 'unknown'].includes(primary.certainty)) {
    addReason(reasons, 'uncertain-deadline', 25, `主截止可信度：${primary.certainty}`);
  }

  if (status === 'unverified' && (daysToDeadline === null || daysToDeadline >= 0)) {
    addReason(reasons, 'active-unverified', 20, '活跃或待开放记录尚未完成事实核验');
  }

  if (verification.checkedAt) {
    const checkedAt = parseCompetitionDate(verification.checkedAt);
    const age = checkedAt ? daysBetween(checkedAt, today) : null;
    if (age !== null && age > staleDays) {
      addReason(reasons, 'stale-verification', 30, `距离上次核验 ${age} 天`);
    }
  } else {
    addReason(reasons, 'missing-verification-date', 15, '缺少明确核验日期');
  }

  if (!competition.sources?.some((source) => source.kind === 'official')) {
    addReason(reasons, 'no-official-source', 15, '来源列表中没有标记为 official 的一手来源');
  }

  const score = reasons.reduce((sum, reason) => sum + reason.score, 0);
  return {
    id: competition.id,
    name: competition.name,
    score,
    priority: priorityFor(score),
    primaryDeadline: {
      date: primary.date ?? null,
      certainty: primary.certainty ?? 'unknown',
      label: primary.label ?? null,
      days: daysToDeadline,
    },
    verification: {
      status,
      checkedAt: verification.checkedAt ?? null,
      linkHealth,
    },
    reasons,
  };
}

export function buildCompetitionReviewQueue(items, options = {}) {
  return items
    .map((competition) => reviewCompetition(competition, options))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (
      b.score - a.score
      || (a.primaryDeadline.date ?? '9999-12-31').localeCompare(b.primaryDeadline.date ?? '9999-12-31')
      || a.id.localeCompare(b.id)
    ));
}

export function summarizeReviewQueue(queue) {
  const byPriority = {};
  const byReason = {};
  for (const entry of queue) {
    byPriority[entry.priority] = (byPriority[entry.priority] ?? 0) + 1;
    for (const reason of entry.reasons) {
      byReason[reason.code] = (byReason[reason.code] ?? 0) + 1;
    }
  }
  return { total: queue.length, byPriority, byReason };
}

function parsePositiveInteger(raw, name) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

export function parseArgs(argv) {
  const options = {
    json: false,
    failOnCritical: false,
    limit: 30,
    urgentDays: 14,
    staleDays: 30,
    today: new Date(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--json') options.json = true;
    else if (arg === '--fail-on-critical') options.failOnCritical = true;
    else if (arg === '--limit') {
      options.limit = parsePositiveInteger(next, '--limit');
      index += 1;
    } else if (arg === '--urgent-days') {
      options.urgentDays = parsePositiveInteger(next, '--urgent-days');
      index += 1;
    } else if (arg === '--stale-days') {
      options.staleDays = parsePositiveInteger(next, '--stale-days');
      index += 1;
    } else if (arg === '--today') {
      options.today = startOfLocalDay(next);
      index += 1;
    } else if (arg === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  return `Usage: npm run radar:review -- [options]

Options:
  --today YYYY-MM-DD   Deterministic review date
  --limit N            Maximum rows shown (default: 30)
  --urgent-days N      Urgent window (default: 14)
  --stale-days N       Verification age threshold (default: 30)
  --json               Emit machine-readable JSON
  --fail-on-critical   Exit non-zero when critical review work exists
  --help               Show this message`;
}

function printText(queue, summary, options) {
  console.log(`Competition review queue: ${summary.total} records need attention`);
  console.log(`Priorities: ${JSON.stringify(summary.byPriority)}`);
  console.log(`Reasons: ${JSON.stringify(summary.byReason)}`);
  for (const entry of queue.slice(0, options.limit)) {
    const deadline = entry.primaryDeadline.date ?? entry.primaryDeadline.certainty;
    console.log(`- [${entry.priority}] ${entry.id} · ${deadline} · score ${entry.score}`);
    console.log(`  ${entry.reasons.map((reason) => reason.code).join(', ')}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const queue = buildCompetitionReviewQueue(competitions, options);
  const summary = summarizeReviewQueue(queue);
  if (options.json) {
    console.log(JSON.stringify({
      generatedAt: new Date().toISOString(),
      reviewDate: formatLocalDate(options.today),
      summary,
      items: queue.slice(0, options.limit),
    }, null, 2));
  } else {
    printText(queue, summary, options);
  }
  if (options.failOnCritical && summary.byPriority.critical) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
