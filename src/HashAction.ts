/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import Settings from './Settings';
import Logger from './Logger';
import Notifications from './Notifications';

let remoteAddress: vscode.Uri;

const resolveRemote = async (hash: string) => {

    const root = vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath;
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(`${root}/.git/config`));

    const [,, uri] = String(bytes).match(/(url = )(.*)\n/m) ?? [];
    Logger.log.debug(`Resolved remote: ${uri}`);
    if (!uri) {
        throw Error('Remote url could not be resolved');
    }

    let remote = undefined;

    if (uri.startsWith('git@')) {
        remote = `https://${uri.replace('git@', '').replace(':', '/').replace('.git', '')}`;
    } else {
        remote = uri.replace('.git', '');
    }
    
    Logger.log.debug(`Parsed remote address: ${remote}`);

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
