import { GitTree } from './../types';
import axios from 'axios'
import * as fs from 'fs'

export async function getRepoTree(url:string, token:string) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    }
    const branchUrl = `https://api.github.com/repos/${url}/branches/master`
    const req = await axios.get(branchUrl, {
        headers
    })
    const branches = req.data
    // fs.writeFileSync('branches.json', JSON.stringify(branches))

    const treeUrl = `https://api.github.com/repos/${url}/git/trees/${branches.name}?recursive=1`

    const req2 = await axios.get(treeUrl, {
        headers
    })
    const tree:GitTree = req2.data
    // fs.writeFileSync('tree.json', JSON.stringify(tree))
    return tree
}


export async function getRepo(repo: string, token: string) {
    const headers = {
        Authorization: `Bearer ${token}`,
    }
    const url = `https://api.github.com/repos/${repo}`
    const req = await axios.get(url, {
        headers: headers
    })
    var data = req.data
    return data
}