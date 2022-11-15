import * as fs from "fs";
import { join } from "path";
import * as dotenv from 'dotenv'
import axios from 'axios'
import { exec } from "child_process";

dotenv.config();

const USER = process.env.GITHUB_USER;
const TOKEN = process.env.GITHUB_PAT;

async function queryRepos(
  query: string,
  page: number,
  config: any
): Promise<any[]> {
  const numRepos = config.repos.numRepos;
  const languages = config.repos.languages;
  const perPage =
    numRepos < page + 1 * 100 ? numRepos % 100 : 100;
  console.log(`Querying page ${page} with ${perPage} results`);
  let languagesStr = "";
  for (const lang of languages) {
    console.log(lang);
    languagesStr += `language:${lang}+`;
  }
  const queryStr = `${query} ${languagesStr} &per_page=${perPage}&page=${page}&sort=stars`;
  const queryUrl = `https://api.github.com/search/repositories?q=${queryStr}`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
  }
  const req = await axios.get(queryUrl, {
    headers: headers
  })
  const data = req.data;
  const items: any[] = [];
  for (let idx = 0; idx < data.items.length; idx++) {
    if (idx + 1 > numRepos) {
      break;
    }
    items.push(data.items[idx]);
  }
  return items;
}

export async function getRepos(query: string, config:any): Promise<void> {
  console.log("Getting repos");
  const fileDirectory = join("./data", query.replace(" ", "_"));
  if (!(await fs.existsSync(fileDirectory))) {
    await fs.mkdirSync(fileDirectory);
  }
  const queryResults: any[] = [];
  for (let pageNum = 0; pageNum < 5; pageNum++) {
    queryResults.push(...(await queryRepos(query, pageNum, config)));
    if (pageNum + 1 * 100 > config.repos.numRepos) {
      break;
    }
  }
  await fs.writeFileSync(
    join(fileDirectory, "github_repos.json"),
    JSON.stringify(queryResults)
  );
}

export async function downloadRepos(query: string): Promise<void> {
  const fileDirectory = join("./data", query.replace(" ", "_"));
  const reposFile = join(fileDirectory, "github_repos.json");
  const downloadDir = join(fileDirectory, "repos");
  if (!(await fs.existsSync(downloadDir))) {
    await fs.mkdirSync(downloadDir);
  }
  const data: any[] = JSON.parse(
    await fs.readFileSync(reposFile, { encoding: "utf-8" })
  );
  for (const x of data) {
    console.log(x.name, x.stargazers_count);
    await exec(`git clone ${x.clone_url} ${join(downloadDir, x.name)}`);
  }
}

export async function downloadRepo(repo: string): Promise<void> {
  return new Promise((resolve, reject) => { 
    const downloadDir = "/tmp/data/repos"
  if (!(fs.existsSync('/tmp/data'))) {
      fs.mkdirSync('/tmp/data');
    }
  if (!(fs.existsSync(downloadDir))) {
    fs.mkdirSync(downloadDir);
  }

  const proc = exec(`git clone https://github.com/${repo}.git ${join(downloadDir, repo.split("/")[1])}`);
    proc.on('exit', (code) => { 
      console.log(`Child exited with code ${code}`);
      resolve();
  })
})
}