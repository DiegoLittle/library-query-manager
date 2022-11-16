# Library Query Manager
This is a library that allows you to make query for a library, package, or project by search Github and Package Managers like npm with a configuration file to make it easier to find the library that suits your needs.


### Setup
1. Clone this repository
```bash
git clone 
```
2. Install the dependencies
```bash
npm install
```

### Config
[repos]
num_repos = 3
- Number of github repositories to query
languages = ['typescript','javascript','python']
- Languages to query
query = "language server"
- Query to search for

[repo.search]
inodes_search = ['*.ts','*.js']
- List of directories or files to search for in a repo
- Can use wildcards like '*.py' to search for all python files

[package_managers]
pypi = false
npm = true
- Whether to use package managers to search for dependencies



