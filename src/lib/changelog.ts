import { execSync } from "child_process";

export interface Commit {
  sha:    string;
  msg:    string;
  date:   string;
  author: string;
}

export function getChangelog(limit = 60): Commit[] {
  try {
    const out = execSync(`git log --pretty=format:"%H|||%s|||%ai|||%an" -${limit}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (!out) return [];
    return out.split("\n").map((line) => {
      const [sha, msg, date, author] = line.split("|||");
      return { sha: (sha ?? "").slice(0, 7), msg: msg ?? "", date: date ?? "", author: author ?? "" };
    });
  } catch {
    return [];
  }
}

export type { Commit as ChangelogEntry };
