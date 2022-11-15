# Library Query Manager
This is a library that allows you to make query for a library, package, or project by search Github and Package Managers like npm with a configuration file to make it easier to find the library that suits your needs. This is a typescript version of a similar program I wrote in Python https://github.com/DiegoLittle/library-query-manager


### Setup
1. Clone this repository
```bash
git clone 
```
2. Install the dependencies
```bash
npm install
```
3. Setup prisma
```bash
touch .env && echo "DATABASE_URL=file:./prisma/dev.db" > .env
touch prisma/dev.db
npx prisma generate
npx prisma db push
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



