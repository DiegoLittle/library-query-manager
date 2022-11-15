import { prisma } from './db';
import { Config, Dependant } from './types';
import axios from 'axios';
import * as dotenv from 'dotenv'
import { getRepoDependents } from './downloading/single';
import { downloadRepo } from './downloading/downloading';
import * as fs from 'fs'
import { enumerateCodeBlocks, enumFilename } from './search/single_repo';
import toml from 'toml'


dotenv.config();

const USER = process.env.GITHUB_USER;
const TOKEN = process.env.GITHUB_PAT;


export interface Setup {
    clone?: boolean,
    package_manager?: string | null,
    installs?: string[] | null,
    setup?: null | null,
    sections?: string[],
};

export class Repo {
    name: string | null
    user: string | null
    url: string
    github_data?: any
    setup: Setup| null = {}
    topics: string[]
    inodes: any = {} 
    fullUrl: string
    dependents: Dependant[]
    config: Config
    repoPath: string
    GITHUB_TOKEN: string
    alreadyIndexed: boolean = false
    id: string | null = null
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
    }>){
        Object.assign(this, init);
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

    async initalizeRepo(query = true, download = true, enumerate = true, serialize = true) {

        try {
            
            const existing = await prisma.repo.findFirst({
                where: {
                    url: this.url
                }
            })
            if (existing) {
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
                return existing
             }
        } catch (error) {
            console.log(error)
        }

        try {
            await this.queryRepo(this.GITHUB_TOKEN)
        } catch (error) {
            console.log(error)
        }
        try {
            if (this.github_data.network_count > 0) {
                await this.getDependents()
            }
        } catch (error) {
            console.log(error)
        }
        try {
            await this.downloadRepo()
        } catch (error) {
            console.log(error)
        }
        try {
            this.enumerateRepo()
        } catch (error) {
            console.log(error)
        }

        
        
    }

    async queryRepo(GITHUB_TOKEN) {
        // repo - OWNER/REPO
        const queryUrl = `https://api.github.com/repos/${this.url}`;
        const headers = {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
        }
        const req = await axios.get(queryUrl, {
            headers: headers
        })
        var data = req.data;
        this.github_data = data;
        this.topics = data['topics'];
        return data
    }
    async getDependents() { 
        this.dependents = await getRepoDependents(this.url)
        if(this.dependents === undefined) {
            this.dependents = []
        }
    }
    async downloadRepo() {
        await downloadRepo(this.url)
    }
    enumerateRepo() {
        const repo_dir_path = `/tmp/data/repos/${this.name}`
        // const repo = new Repo(repo_dir, this.github_data['html_url'], repo_api_obj, repo_api_obj['topics']);
        const setup:Setup= {}
        // inodes = search_inodes(repo_dir_path)
        for (const file of fs.readdirSync(repo_dir_path)) {
            // py_files = enum_python_files(repo_dir_path)
            for (const inode of this.config['repo']['search']['inodes']) {
                const indoes = enumFilename(repo_dir_path, inode);
                this.inodes[inode] = indoes;
            }
            if (file.includes('README')) {
                const readme = fs.readFileSync(repo_dir_path + '/' + file, 'utf8');
                const sections: string[] = [];
                const lines = readme.split('\n');
                for (const line of lines) {
                    if (line.startsWith('#')) {
                        sections.push(line);
                    }
                }
                setup.sections = sections;
                setup.clone = readme.includes('git clone');
                if (readme.includes('pip install')) {
                    setup.package_manager = 'pip';
                } else if (readme.includes('conda install')) {
                    setup.package_manager = 'conda';
                }
                enumerateCodeBlocks(readme, setup);
                // if len(setup.installs) > 0:
                
            }
        }
        this.setup = setup;
        
    }


    async saveToDB() {
        if (this.alreadyIndexed) { 
            console.log(`Repo ${this.url} already exists in database`)
            await prisma.repo.update({
                where: {
                    id: this.id
                },
                data: {
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
                }
            })
        } else {
            await prisma.repo.create({
                data: {
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
    
                }
            })
        }


        return this
    }
}