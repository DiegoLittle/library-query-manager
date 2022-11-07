import copy
import json
import os
from models import Repo, Setup
from search.single_repo import enum_filename, enumerate_code_blocks
import shutil



def enumerate_repos(query,config):
    github_data_path = './data/'+query.replace(" ", "_")+'/github_repos.json'
    repos_dir='./data/'+query.replace(" ", "_")+'/repos'
    save_path = './data/'+query.replace(" ", "_")+'/results.json'
    with open(github_data_path,'r') as f:
        data = json.load(f) 
    repos = []
    for repo_dir in os.listdir(repos_dir):
        repo_api_obj = [item for item in data if item['name'] == repo_dir][0]
        repo = Repo(repo_dir,repo_api_obj['html_url'],repo_api_obj,topics=repo_api_obj['topics'])
        setup = Setup()
        repo_dir_path = os.path.join(repos_dir,repo_dir)
        # inodes = search_inodes(repo_dir_path)
        for file in os.listdir(repo_dir_path):
            # py_files = enum_python_files(repo_dir_path)
            for inode in config['repo']['search']['inodes']:
                indoes = enum_filename(repo_dir_path,inode)
                repo.inodes[inode] = indoes
            if 'README' in file:
                with open(repos_dir+'/'+repo_dir+'/'+file, 'r') as f:
                    readme = f.read()
                sections = []
                lines = readme.split('\n')
                for line in lines:
                    if line.startswith('#'):
                        sections.append(line)
                setup.sections = sections

                setup.clone = 'git clone' in readme
                if 'pip install' in readme:
                    setup.package_manager = 'pip'
                elif 'conda install' in readme:
                    setup.package_manager = 'conda'
                
                enumerate_code_blocks(readme,setup)
                # if len(setup.installs) > 0:
                repo.setup = setup
        repos.append(copy.deepcopy(repo.serialize()))
    # repos = [repo.serialize() for repo in repos]
    with open(save_path, 'w') as f:
        f.write(json.dumps(repos, indent=4))
    
    if config['repos']['delete_repos']:
        for repo_dir in os.listdir(repos_dir):
            shutil.rmtree(repos_dir+'/'+repo_dir,ignore_errors=True)
    
    return repos