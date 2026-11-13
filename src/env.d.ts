/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type StatObject = Record<
  string,
  {
    date: string;
    data: Record<
      string,
      { issuePerLabel: Record<string, number>; issueCount: number; pullRequestPerLabel?: Record<string, number>; pullRequestCount?: number;  }
    >;
  }
>;

declare module "issues:stats" {
  export const statsFromLast30Days: StatObject;
  export const allRepos: string[];
}
