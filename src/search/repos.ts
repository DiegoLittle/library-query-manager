import fs from 'fs';
import path from 'path';
import { Repo, Setup } from '../models';
import { enumerateCodeBlocks, enumFilename } from './single_repo';



// export function enumerateRepos(query: string, config: any) {
//     const github_data_path = './data/' + query.replace(' ', '_') + '/github_repos.json';
//     const repos_dir = './data/' + query.replace(' ', '_') + '/repos';
//     const save_path = './data/' + query.replace(' ', '_') + '/results.json';
//     const data = JSON.parse(fs.readFileSync(github_data_path, 'utf8'));
//     const repos: any[] = [];
//     for (const repo_dir of fs.readdirSync(repos_dir)) {
//         const repo_api_obj = data.filter((item) => item['name'] === repo_dir)[0];
//         const repo = new Repo(repo_dir, repo_api_obj['html_url'], repo_api_obj, repo_api_obj['topics']);
//         const setup:Setup= {}
//         const repo_dir_path = path.join(repos_dir, repo_dir);
//         // inodes = search_inodes(repo_dir_path)
//         for (const file of fs.readdirSync(repo_dir_path)) {
//             // py_files = enum_python_files(repo_dir_path)
//             for (const inode of config['repo']['search']['inodes']) {
//                 const indoes = enumFilename(repo_dir_path, inode);
//                 repo.inodes[inode] = indoes;
//             }
//             if (file.includes('README')) {
//                 const readme = fs.readFileSync(repos_dir + '/' + repo_dir + '/' + file, 'utf8');
//                 const sections: string[] = [];
//                 const lines = readme.split('\n');
//                 for (const line of lines) {
//                     if (line.startsWith('#')) {
//                         sections.push(line);
//                     }
//                 }
//                 setup.sections = sections;
//                 setup.clone = readme.includes('git clone');
//                 if (readme.includes('pip install')) {
//                     setup.package_manager = 'pip';
//                 } else if (readme.includes('conda install')) {
//                     setup.package_manager = 'conda';
//                 }
//                 enumerateCodeBlocks(readme, setup);
//                 // if len(setup.installs) > 0:
//                 repo.setup = setup;
//             }
//         }
//         repos.push(repo.serialize());
//     }
//     // repos = [repo.serialize() for repo in repos]
//     fs.writeFileSync(save_path, JSON.stringify(repos, null, 4));
//     if (config['repos']['delete_repos']) {
//         for (const repo_dir of fs.readdirSync(repos_dir)) {
//             fs.rmdirSync(repos_dir + '/' + repo_dir, { recursive: true });
//         }
//     }
//     return repos;
// }

export function enumerateRepo() {
    const repo = new Repo(repo_dir, repo_api_obj['html_url'], repo_api_obj, repo_api_obj['topics']);
    const setup:Setup= {}
    const repo_dir_path = path.join('repos_dir', repo_dir);
    // inodes = search_inodes(repo_dir_path)
    for (const file of fs.readdirSync(repo_dir_path)) {
        // py_files = enum_python_files(repo_dir_path)
        for (const inode of config['repo']['search']['inodes']) {
            const indoes = enumFilename(repo_dir_path, inode);
            repo.inodes[inode] = indoes;
        }
        if (file.includes('README')) {
            const readme = fs.readFileSync(repos_dir + '/' + repo_dir + '/' + file, 'utf8');
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
            repo.setup = setup;
        }
    }
    
}