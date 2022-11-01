import json
from typing import List, Optional
import pandas as pd
from downloading import download_repos, get_repos


from models import Repo, Setup
from search.repos import enumerate_repos
import tomli

with open('config.toml','rb') as f:
    config = tomli.load(f)
query = config['repos']['query']




def main():
    get_repos(query,config)
    download_repos(query)
    repos = enumerate_repos(query,config)
    # Create directories based on query
    
    pass



main()