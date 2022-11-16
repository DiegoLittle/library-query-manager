import toml from 'toml'
import * as fs from "fs";
import { Repo } from "./models";
import * as dotenv from 'dotenv'

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'))
// with open("config.toml", "rb") as f:
//     config = load(f);
const query = config.repos.query;
dotenv.config();

const USER = process.env.GITHUB_USER;
const TOKEN = process.env.GITHUB_PAT;
async function main() {

    // const url = 'tohhongxiang123/nextjs-lexical-test'
    // const repo = new Repo({
    //     url: url,
    //     config: config,
    //     dbPath: './db/dev.db',
    //     GITHUB_TOKEN: TOKEN
    // })
    // await repo.initalizeRepo()
    // const data = repo.saveToDB()
    // # Create directories based on query
}