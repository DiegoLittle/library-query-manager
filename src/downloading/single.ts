import { Dependant } from '../types';
import * as dotenv from 'dotenv'
import axios from 'axios'
import parse from "node-html-parser";
import puppeteer from 'puppeteer';

dotenv.config();

const USER = process.env.GITHUB_USER;
const TOKEN = process.env.GITHUB_PAT;


export async function queryRepo(repo: string) {
    // repo - OWNER/REPO
    const queryUrl = `https://api.github.com/repos/${repo}`;
    const headers = {
        Authorization: `Bearer ${TOKEN}`,
    }
    const req = await axios.get(queryUrl, {
        headers: headers
    })
    var data = req.data;
    return data
}


const getPageDependents = async (browser: puppeteer.Page): Promise<{
    dependents: Dependant[],
    next: boolean
}> => { 
    const html = await browser.evaluate(() => { 
        return document.body.innerHTML
    })
    const root = parse(html)
    var dependentsElements = root.querySelectorAll('div[data-test-id="dg-repo-pkg-dependent"]')
    var box = root.querySelectorAll('#dependents > div.Box > .Box-row')
    
    var dependents = box.map((dependent):Dependant|null => { 
        var userElem = dependent.querySelector('a[data-hovercard-type="user"]')
        if (userElem == null) {
            const organizationElem = dependent.querySelector('a[data-hovercard-type="organization"]')
            if (organizationElem == null) {
                return null
            }
            userElem=   organizationElem
        }
        const user = userElem.innerText

        const repoElem = dependent.querySelector('a[data-hovercard-type="repository"]')
        if (repoElem == null) {
            return null
        }
        const repo = repoElem.innerText
        return {
            user: user,
            repo: repo
        }
    })
    const aTag = root.querySelector('div[data-test-selector="pagination"] > a:nth-child(2)')
    const button = root.querySelector('div[data-test-selector="pagination"] > button:nth-child(2)')
    
    // console.log(aTag == null)
    // console.log(button == null)
    const next = aTag != null
    if (dependents == null) {
        return {
            dependents: [],
            next: false
        }
    }
    if (dependents != null) { 
        return {
            dependents: dependents = dependents.filter((d) => d != null) as Dependant[],
            next: next
        }
    }
    console.log("Error getting dependents")
    return {
        dependents: [],
        next: false
    }


}
    
async function recursivelyGetDependents(page: puppeteer.Page) {
    const allDependents:Dependant[] = []
    while (true) {
        const { dependents, next } = await getPageDependents(page)
        allDependents.push(...dependents)
        if (next) {
            try {
                
            } catch (error) {
                console.log(await page.evaluate(() => {
                    document.querySelector('div[data-test-selector="pagination"] > a:nth-child(2)')
                }))
                console.log(error)
                break
            }
            await page.click('div[data-test-selector="pagination"] > a:nth-child(2)')
            await new Promise((resolve) => setTimeout(resolve, 500))
        } else {
            break
        }
    }
    return allDependents
}

export async function getRepoDependents(repo: string) {

    const url = `https://github.com/${repo}/network/dependents`
    const headers = {
        Authorization: `Bearer ${TOKEN}`,
    }
    // const browser = new Browser(undefined,true);
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage()
    await page.goto(url)

    const dependents = await recursivelyGetDependents(page)
    // toJson(dependents, './downloading/dependents.json');
    return dependents

    
}