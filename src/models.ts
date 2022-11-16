import { MikroORM } from '@mikro-orm/core';
import {  findRepo, RepoEntity, setupDB } from './db/sqllite';
import { Config, Dependant, Setup } from './types';
import * as dotenv from 'dotenv'
import { getRepoDependents } from './downloading/single';
import { enumerateRepo} from './search/repo';
import { getRepo, getRepoTree } from './github/repo';
import { enumerateGitTree } from './search/javascript/coreEnumeration';
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { randomUUID } from 'crypto';


dotenv.config();

const USER = process.env.GITHUB_USER;
const TOKEN = process.env.GITHUB_PAT;




export class Repo {
    name: string
    user: string | null
    url: string
    github_data?: any
    setup: Setup | null = {}
    topics: string[]
    inodes: any = {}
    fullUrl: string
    dependents: Dependant[] = []
    config: Config
    repoPath: string
    GITHUB_TOKEN: string
    alreadyIndexed: boolean = false
    id: string | null = null
    // db: sqlite3.Database
    dbPath: string | null = null
    tree: any
    foundInodes?: any = {}
    // Add JSDOC comment here
    /**
     * @param url Required repo url in format OWNER/REPO
     * 
     */
    constructor(init: Partial<{
        name: string | null,
        url: string,
        github_data: any,
        topics: string[],
        setup: Setup | null
        inodes: any
        config: Config
        GITHUB_TOKEN: string
        dbPath: string | null
    }>) {
        console.log("Initalizing repo")
        Object.assign(this, init);
        if (init.dbPath) {
            this.dbPath = init.dbPath
        }
        if (init.config === undefined) {
            throw new Error('Config is required')
        }
        if (init.GITHUB_TOKEN === undefined && TOKEN === undefined) {
            throw new Error('GITHUB_PAT not set in environment variables or passed to constructor')
        }
        if (!this.url) {
            throw new Error('Repo must have a url')
        } else {
            this.name = this.url.split('/')[1]
            this.user = this.url.split('/')[0]
            this.fullUrl = `https://github.com/${this.url}`
        }
    }


    async initalizeRepo({
        // query = true, download = true, enumerate = true, serialize = true,depdents=
        query = true,
        download = true,
        enumerate = true,
        dependents = true,
        debug = true
    } = {}) {
        // const rateLimit = await getRateLimit(this.GITHUB_TOKEN)
        // console.log("Rate limit", rateLimit)
        await setupDB(this.dbPath)

        const existing = await findRepo(this.dbPath, this.url)
        if (existing !== null) {
            this.alreadyIndexed = true;
            console.log(`Repo ${this.url} already exists in database`)
            // console.log(existing)
            this.id = existing.id
            if (existing.config) {
                this.config = JSON.parse(existing.config)
            }
            try {
                this.github_data = JSON.parse(existing.github_data)
                this.topics = JSON.parse(existing.topics)
            } catch (error) {
                console.log(error)
            }
            this.setup = JSON.parse(existing.setup)
            this.inodes = JSON.parse(existing.inodes)
            this.dependents = JSON.parse(existing.dependents)
            this.fullUrl = existing.fullUrl
            this.name = existing.name
            this.user = existing.user
            this.setup = JSON.parse(existing.setup)
            this.tree = JSON.parse(existing.tree)
            return existing
         }

        if(query){
            if (debug) {
                console.log("Querying repo")
            }
            await this.queryRepo(this.GITHUB_TOKEN)
        }
        if (dependents) {
            if (this.github_data.network_count == undefined) {
                await this.queryRepo(this.GITHUB_TOKEN)
            }
            console.log("Getting dependents")
            if (this.github_data.network_count > 0 && dependents) {
                await this.getDependents()
            }
        }
        if (enumerate) { 
            console.log("Enumerating repo")
            this.enumerateRepo()
        }
    }

    async queryRepo(token: string) {
        // repo - OWNER/REPO
        try {
            this.github_data = await getRepo(this.url, this.GITHUB_TOKEN)
            this.topics = this.github_data['topics'];
            this.tree = await getRepoTree(this.url, this.GITHUB_TOKEN)
            console.log("Got tree")
        } 
        catch (error) {
            console.log(error)
        }
    }
    async getDependents() {
        this.dependents = await getRepoDependents(this.url)
        if (this.dependents === undefined) {
            this.dependents = []
        }
    }
    enumerateRepo() {
        console.time('enumerateRepo')
        const enumResult = enumerateRepo(this.name, this.config)
        this.inodes = enumResult.inodes
        this.setup = enumResult.setup
        console.timeEnd('enumerateRepo')
    }
    async enumerateGitTree() {
        if (this.tree === undefined) {
            console.log("Getting tree")
            this.tree = await getRepoTree(this.url, this.GITHUB_TOKEN)
        }
        console.log("Enumerating tree")
        const inodes = enumerateGitTree(this.tree)
        this.foundInodes = inodes
        return inodes
    }



    async saveToDB() {
        const orm: MikroORM = await MikroORM.init({
            metadataProvider: TsMorphMetadataProvider,
            entities: [RepoEntity],
            dbName: this.dbPath,
            type: "sqlite",
            debug: false
        });
        const data = {
            id: this.id || randomUUID(),
            name: this.name,
            url: this.url,
            github_data: JSON.stringify(this.github_data),
            topics: JSON.stringify(this.topics),
            setup: JSON.stringify(this.setup),
            inodes: JSON.stringify(this.inodes),
            dependents: JSON.stringify(this.dependents),
            config: JSON.stringify(this.config),
            fullUrl: this.fullUrl,
            user: this.user,
            tree: JSON.stringify(this.tree),
        }
        // const repo = new RepoEntity();
        const fork = orm.em.fork();
        await fork.upsert(RepoEntity, data);
        await orm.close(true);
        return this
    }
}