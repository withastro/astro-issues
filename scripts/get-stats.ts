import { Octokit } from "@octokit/core";
import fs from "node:fs";

process.loadEnvFile('.env') 

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({
  auth: process.env.STATS_COLLECT_TOKEN,
});

const repos = await octokit.request("GET /orgs/{org}/repos", {
  org: "withastro",
	type: "sources",
  per_page: 100, // Maybe one day we'll have more than 100 repos
});

const data: Record<
  string,
  { issuePerLabel: Record<string, number>; issueCount: number }
> = {};

for (const repo of repos.data) {
	if (repo.archived) continue;

  const allIssues = await getAllIssues(repo.name);

  data[repo.name] = {
    issuePerLabel: allIssues.reduce((acc: Record<string, number>, issue) => {
      issue.labels.forEach((label) => {
        const labelName = typeof label === "string" ? label : label.name ?? "";
        if (!acc[labelName]) {
          acc[labelName] = 0;
        }
        acc[labelName] += 1;
      });
      return acc;
    }, {}),
    issueCount: allIssues.length,
  };
}

async function getAllIssues(repo: string, page = 1) {
  const per_page = 100;

  const { data: issues, headers } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues",
    {
      owner: "withastro",
      repo,
      page,
      per_page,
			state: "open",
    },
  );

  if (headers.link?.includes('rel="next"')) {
    const nextPage = await getAllIssues(repo, page + 1);
    issues.push(...nextPage);
  }

  return issues.filter((issue) => !issue.pull_request);
}

const date = new Date().toISOString();
const result = {
  date: date,
  data,
};

fs.writeFileSync(
  `src/data/${date.substring(0, date.indexOf("T"))}.json`,
  JSON.stringify(result, null, 2),
);
