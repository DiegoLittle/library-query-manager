export interface Dependant {
    user: string;
    repo: string;
}

export interface Setup {
    clone?: boolean,
    package_manager?: string | null,
    installs?: string[] | null,
    setup?: null | null,
    sections?: string[],
};


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


export interface GitTree {
	sha: string;
	url: string;
	tree: TreeItem[];
	truncated: boolean
}
export interface TreeItem {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size: number;
	url: string;
}