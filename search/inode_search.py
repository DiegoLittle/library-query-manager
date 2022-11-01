import os
from search.single_repo import enum_filename


inodes= {
    'inode':[]
}


def search_inodes(repo_dir_path:str) -> dict:
    
    vscode_dir = enum_filename(os.path.join(repo_dir_path),'.vscode',False)
    if len(vscode_dir) > 0:
            print('Found vscode dir')
            