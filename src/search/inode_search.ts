import { join } from "path";
import { enumFilename } from "./single_repo";

const inodes = {
    inode: []
};

function search_inodes(repo_dir_path: string) {
    const vscode_dir = enumFilename(join(repo_dir_path), '.vscode', false);
    if (vscode_dir.length > 0) {
        console.log('Found vscode dir');
    }
}