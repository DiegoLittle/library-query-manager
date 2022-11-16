import * as fs from 'fs'
import { GitTree } from '../../types'


const defaultInodes = ["next.config", "tailwind.config", "package.json"]
const filterPaths = ["node_modules"]
function pathIncludesInodes(path: string) {
    var result = false
    for (const inode of filterPaths) {
        if (path.includes(inode)) {
            result = false
            return result
        }
    }
    for (const inode of defaultInodes) {
        if (path.includes(inode)) {
            result = true
            return result
        }
    }
    return result
}

export function enumerateGitTree(tree: GitTree) {
    const result = {}
    // console.log("ENUMERATING GIT TREE")
    try {
        tree.tree.forEach((item) => {
            const includedInodes = pathIncludesInodes(item.path)
            if (includedInodes) {
                result[item.path] = includedInodes
            }
        })
        
    } catch (error) {
        console.log(error)
        
    }

    return result
    
}