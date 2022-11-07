import json
import os
import re


def enum_filename(repo_dir_path,inode_name,isFile=True):
    indoes = []    
    if '*' in inode_name:
        inode_name = inode_name.replace('*','')
    for file in os.listdir(repo_dir_path):
        if isFile:
            if os.path.isdir(os.path.join(repo_dir_path,file)):
                indoes.extend(enum_filename(os.path.join(repo_dir_path,file),inode_name))
            elif file.endswith(inode_name):
                indoes.append(file)
        else:
            if os.path.isdir(os.path.join(repo_dir_path,file)):
                # TODO Recurse through directories
                if file.endswith(inode_name):
                    indoes.append(file)
    return indoes

def enumerate_code_blocks(readme,setup):
    code_blocks_start_end = readme.split('```')
    code_blocks = []
    for i in range(len(code_blocks_start_end)):
        if i % 2 == 1:
            code_blocks.append(code_blocks_start_end[i])
    
    if len(code_blocks) > 0:
        setup.setup = code_blocks[0]
        for code_block in code_blocks:
            if 'pip install' in code_block:
                install = 'pip install ' +code_block.split('pip install')[1].strip()
                if 'requirements.txt' in install:
                    setup.clone = True
                setup.installs.append(install)
        
        with open('code_blocks.json', 'w') as f:
            json.dump(code_blocks, f)
        

def enum_python_files(repo_dir_path):
    python_files = []
    for file in os.listdir(repo_dir_path):
        if os.path.isdir(os.path.join(repo_dir_path,file)):
            python_files.extend(enum_python_files(os.path.join(repo_dir_path,file)))
        elif file.endswith('.py'):
            python_files.append(file)
    return python_files