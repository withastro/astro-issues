import type { PluginOptionsByType } from "chart.js";
import { allRepos, statsFromLast30Days } from "issues:stats";

export function getTimeSeriesForRepo(repo: string, metric: "issueCount" | "pullRequestCount") {
  return Object.values(statsFromLast30Days).map((stats) => {
    return stats.data?.[repo]?.[metric] ?? 0;
  });
}

export function getAverageCountForRepo(repo: string, metric: 'issueCount' | 'pullRequestCount', lastDays = 5) {
  const data = getTimeSeriesForRepo(repo, metric).slice(-lastDays);
  const sum = data.reduce((a, b) => a + b, 0);
  const avg = sum / data.length || 0;

  return avg;
}

const HIDDEN_REPOS = [
  // low-activity
  "wormhole",
  "site-kit",
  // issues + PRs disabled
  "community-support", 
  // unmaintained/abandoned
  "compiler",
  "skew-protection-test",
  "server-islands-api",
  "server-islands",
  "starlight-gh-pages-test",
  "action-studio",
  "storefront",
  "studio-templates",
  "astro-ecosystem-ci",
  "astro-maintainer-skills",
  "skills",
  "astro-netlify-skew-protection",
  "workers-builds-log-action",
  "recall",
  "triagebot-action",
  "astro-test",
  "isastroenvironmentready",
  // non-Astro projects
  "flue",
  "marlo",
];

export const filteredRepos = allRepos.filter((repo) => !HIDDEN_REPOS.includes(repo));
const dataForMetric = (metric: "issueCount" | "pullRequestCount") => ({
  labels: [...Object.keys(statsFromLast30Days)],
  datasets: [
    ...filteredRepos.map((repo) => ({
      label: repo,
      data: getTimeSeriesForRepo(repo, metric),
      borderWidth: 1,
      fill: true,
      hidden: HIDDEN_REPOS.includes(repo) || getAverageCountForRepo(repo, metric) < 7,
    })),
  ],
});

export const allReposIssueData = dataForMetric("issueCount");
export const allReposPRData = dataForMetric("pullRequestCount");

const sortedReposWithHighIssues = allReposIssueData.datasets
  .filter((dataset) => !dataset.hidden)
  .sort((a, b) => {
    const aToday = a.data.at(-1)!;
    const bToday = b.data.at(-1)!;

    return bToday - aToday;
  });

export const todayData = {
  labels: sortedReposWithHighIssues.map((dataset) => dataset.label),
  datasets: [
    {
      label: "Issues",
      data: sortedReposWithHighIssues.map((dataset) => dataset.data.at(-1)),
    },
  ],
};

export const sortLegend: PluginOptionsByType<
  "pie" | "line"
>["legend"]["labels"]["sort"] = (a, b) =>
  getAverageCountForRepo(b.text, 'issueCount') - getAverageCountForRepo(a.text, 'issueCount');

export const sortTooltips: PluginOptionsByType<
  "pie" | "line"
>["tooltip"]["itemSort"] = (a, b) => b.parsed.y - a.parsed.y;
