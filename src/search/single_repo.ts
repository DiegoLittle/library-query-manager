import * as fs from 'fs';
import { join } from 'path';


export function enumFilename(repoDirPath: string, inodeName: string, isFile: boolean = true): string[] {
    const indoes: string[] = [];

    if (inodeName.includes('*')) {
        inodeName = inodeName.replace('*', '');
    }

    for (const file of fs.readdirSync(repoDirPath)) {
        if (isFile) {
            if (fs.lstatSync(join(repoDirPath, file)).isDirectory()) {
                indoes.push(...enumFilename(join(repoDirPath, file), inodeName));
            } else if (file.endsWith(inodeName)) {
                indoes.push(file);
            }
        } else {
            if (fs.lstatSync(join(repoDirPath, file)).isDirectory()) {
                // TODO Recurse through directories
                if (file.endsWith(inodeName)) {
                    indoes.push(file);
                }
            }
        }
    }

    return indoes;
}

export function enumerateCodeBlocks(readme: string, setup: any): void {
    const codeBlocksStartEnd: string[] = readme.split('```');
    const codeBlocks: string[] = [];

    for (let i = 0; i < codeBlocksStartEnd.length; i++) {
        if (i % 2 === 1) {
            codeBlocks.push(codeBlocksStartEnd[i]);
        }
    }

    if (codeBlocks.length > 0) {
        setup.setup = codeBlocks[0];

        for (const codeBlock of codeBlocks) {
            if (codeBlock.includes('pip install')) {
                const install: string =
                    'pip install ' + codeBlock.split('pip install')[1].trim();

                if (install.includes('requirements.txt')) {
                    setup.clone = true;
                }

                setup.installs.push(install);
            }
        }

        const codeBlocksJson: string = JSON.stringify(codeBlocks);

        fs.writeFileSync('code_blocks.json', codeBlocksJson);
    }
}

export function enumPythonFiles(repoDirPath: string): string[] {
    const pythonFiles: string[] = [];

    for (const file of fs.readdirSync(repoDirPath)) {
        if (fs.lstatSync(join(repoDirPath, file)).isDirectory()) {
            pythonFiles.push(...enumPythonFiles(join(repoDirPath, file)));
        } else if (file.endsWith('.py')) {
            pythonFiles.push(file);
        }
    }

    return pythonFiles;
}