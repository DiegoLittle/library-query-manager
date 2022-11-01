# https://github.com/npms-io/npms-api
import json
import requests



def query_npm(query:str):
    url = f'https://registry.npmjs.com/-/v1/search?text={query}'
    r = requests.get(url)
    
    return r.json()
