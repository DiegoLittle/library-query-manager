export interface Dependant {
    user: string;
    repo: string;
}


export interface ReposConfig{
    num_repos: number;
    query: string;
    languages: string[];
    delete_repos: boolean;
}
export interface Config {
    repos: ReposConfig
    repo: {
        search: {
            inodes: string[]
        }
    }
    package_managers: {
        pypi: boolean
        npm: boolean
    }
}