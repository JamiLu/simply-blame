/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import Settings from './Settings';
import { log } from './Logger';
import Notifications from './Notifications';
import * as path from 'path';
import { getLocation } from './Utils';

const remotes: {[key: string]: string} = {};

const findGitFolder = async (uri: vscode.Uri | undefined, projectLocation: string[], index: number): Promise<vscode.Uri | undefined> => {
    if (uri) {
        const lookFor = projectLocation[index];
        const content = await vscode.workspace.fs.readDirectory(uri);
        let found: vscode.Uri | undefined = undefined;

        for (let [name, type] of content) {
            if (type === vscode.FileType.Directory && name === '.git') {
                found = vscode.Uri.joinPath(uri, name);
                break;
            } else if (type === vscode.FileType.Directory && name === lookFor) {
                found = await findGitFolder(vscode.Uri.joinPath(uri, name), projectLocation, index++);
            }
        }

        return found;
    } else {
        throw new Error('Given uri empty. Could not read a directory');
    }
};

const trimProjectLocation = (root: vscode.Uri | undefined, filename: string) => {
    const location = getLocation(filename);
    const lookFor = location.substring(root?.fsPath.length! + 1, location.length - 1);

    if (!lookFor) {
        log.error('Could not resolve project folder from root', root?.fsPath, ',', 'location', location);
        throw new Error(`Could not resolve project folder`);
    }
    log.debug('Resolved project location', lookFor);
    return lookFor.split(path.sep);
};

const resolveRemote = async (filename: string) => {
    const root = vscode.workspace.workspaceFolders?.at(0)?.uri;
    const projectLocation = trimProjectLocation(root, filename);

    if (remotes[projectLocation[0]]) {
        log.debug('Found existing remote address:', remotes[projectLocation[0]]);
        return remotes[projectLocation[0]];
    }

    const gitFolder = await findGitFolder(root, projectLocation, 0);

    if (!gitFolder) {
        throw new Error('Git folder not found in workspace');
    }
    
    log.debug(`Found .git folder: ${gitFolder.fsPath}`);

    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(gitFolder, 'config'));
    const [,, uri] = String(bytes).match(/(url = )(.*)\n/m) ?? [];
    log.debug(`Resolved remote: ${uri}`);

    if (!uri) {
        throw new Error('Remote url could not be resolved');
    }

    let remoteAddress;

    if (uri.startsWith('git@')) {
        remoteAddress = `https://${uri.replace('git@', '').replace(':', '/').replace('.git', '')}`;
    } else {
        remoteAddress = uri.replace('.git', '');
    }
    
    log.debug(`Parsed remote address: ${remoteAddress}`);
    remotes[projectLocation[0]] = remoteAddress;

    return remoteAddress;
};

export const hashAction = async (hash: string, fileName: string) => {
    const action = Settings.getHashAction();
    switch (action) {
        case 'remote':
            try {
                await vscode.env.openExternal(vscode.Uri.parse(`${await resolveRemote(fileName)}/commit/${hash}`));
            } catch (e) {
                Notifications.commonErrorNotification(e as Error, true);
            }
            break;
        default:
        case 'copy':
            vscode.env.clipboard.writeText(hash);
            vscode.window.showInformationMessage(`Commit ${hash} copied to clipboard`);
    }
};
