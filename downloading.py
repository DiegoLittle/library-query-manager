from configparser import ConfigParser
import json
import os
from typing import List
import requests
import os
import dotenv
dotenv.load_dotenv()
USER = os.getenv('GITHUB_USER')
TOKEN = os.getenv('GITHUB_PAT')


def query_repos(query:str,page:int,config:dict) -> List[dict]:
    num_repos = int(config['repos']['num_repos'])
    languages = config['repos']['languages']
    if num_repos<page+1*100:
        per_page = num_repos%100
    else:
        per_page = 100
    print(f'Querying page {page} with {per_page} results')
    languages_str = ''
    for lang in languages:
        print(lang)
        languages_str+=f'language:{lang}+'
    query_str = f"{query} {languages_str} &per_page={per_page}&page={page}&sort=stars"
    query_str = query_str.replace(" ", "+")
    query_url = f'https://api.github.com/search/repositories?q={query_str}'
    r = requests.get(
            query_url,
            auth = (USER, TOKEN)
            )
    data = r.json()
    items = []
    for idx,x in enumerate(data['items']):
        if idx+1 > num_repos:
            break
        items.append(x)
    return items

def get_repos(query:str,config:ConfigParser):
    print('Getting repos')
    file_directory = './data/'+query.replace(" ", "_")
    if not os.path.exists(file_directory):
        os.mkdir(file_directory)
    query_results = []
    for page_num in range(5):
        query_results.extend(query_repos(query,page_num,config))
        if page_num+1*100 > config['repos']['num_repos']:
            break
    with open(file_directory+'/github_repos.json', 'w') as f:
        json.dump(query_results, f)

def download_repos(query:str):
    file_directory = './data/'+query.replace(" ", "_")
    repos_file = file_directory+'/github_repos.json'
    download_dir = file_directory+'/repos'
    if not os.path.exists(download_dir):
        os.mkdir(download_dir)
    with open(repos_file,'r') as f:
        data = json.load(f)

    for x in data:
        print(x['name'], x['stargazers_count'])
        # git.Git("./repos/"+x['name']).clone(x['clone_url'])
        os.system('git clone '+x['clone_url']+f' {download_dir}/'+x['name'])

