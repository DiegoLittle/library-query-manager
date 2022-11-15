import toml from 'toml'
import * as fs from "fs";
import { Repo } from "./models";

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'))
// with open("config.toml", "rb") as f:
//     config = load(f);
const query = config.repos.query;

async function main() {
    var url = 'facebook/lexical'
    url = 'tohhongxiang123/nextjs-lexical-test'
    const repo = new Repo({
        url: url,
        config: config
    })
    await repo.initalizeRepo()
    const data = repo.serialize()
    // await getRepos(query, config);
    // await downloadRepos(query);
    // const repos = await enumerateRepos(query, config);
    // # Create directories based on query
}