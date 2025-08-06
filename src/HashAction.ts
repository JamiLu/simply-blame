/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import Settings from './Settings';
import { log } from './Logger';
import Notifications from './Notifications';

let remoteAddress: vscode.Uri;

const findGitFolder = async (uri: vscode.Uri | undefined): Promise<vscode.Uri | undefined> => {
    if (uri) {
        const content = await vscode.workspace.fs.readDirectory(uri);
        let found: vscode.Uri | undefined = undefined;

        for (let [name, type] of content) {
            if (type === vscode.FileType.Directory && name === '.git') {
                found = vscode.Uri.joinPath(uri, name);
                break;
            } else if (type === vscode.FileType.Directory) {
                found = await findGitFolder(vscode.Uri.joinPath(uri, name));
            }
        }

        return found;
    } else {
        throw new Error('Given uri empty. Could not read a directory');
    }
};

const resolveRemote = async (hash: string) => {
    const root = vscode.workspace.workspaceFolders?.at(0)?.uri;
    const gitFolder = await findGitFolder(root);

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

    let remote = undefined;

    if (uri.startsWith('git@')) {
        remote = `https://${uri.replace('git@', '').replace(':', '/').replace('.git', '')}`;
    } else {
        remote = uri.replace('.git', '');
    }
    
    log.debug(`Parsed remote address: ${remote}`);

    remoteAddress = vscode.Uri.parse(`${remote}/commit/${hash}`);
    return remoteAddress;
};

export const hashAction = async (hash: string) => {
    const action = Settings.getHashAction();
    switch (action) {
        case 'remote':
            try {
                await vscode.env.openExternal(remoteAddress ?? await resolveRemote(hash));
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
