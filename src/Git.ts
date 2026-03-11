/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { command } from './Command';
import Notifications from './Notifications';
import { getFilename, getLocation } from './Utils';
import Settings from './Settings';
import WorkspaceStateHolder from './WorkspaceStateHolder';

export const getCommitMessage = async (document: vscode.TextDocument, commit: string) => {
    const location = getLocation(document.fileName);
    
    try {
        const body = await command(`git show ${commit}`, location);
        const message = body?.substring(body.indexOf('\n\n'), body.search('diff --git'));
        return message?.replace(/^ {2,}/gm, '').trim();
    } catch (e) {
        Notifications.commonErrorNotification(e as Error, true);
    }
};

export const blameFile = async (fileName: string): Promise<string> => {
    const name = getFilename(fileName);
    const location = fileName.replace(name, '');
    const ignoreWhitespace = (WorkspaceStateHolder.state.ignoreWhiteSpaceToggle || Settings.getBlameIgnoreWhitespace()) ? ' -w' : '';

    try {
        return await command(`git blame${ignoreWhitespace} --porcelain "${name}"`, location) ?? '';
    } catch (e) {
        if ((e as Error).message.match(/no such path .* in HEAD/)) {
            vscode.window.showWarningMessage(`File: ${name} is not in HEAD`);
        } else if ((e as Error).message.match(/git\:?\s*(not found)?/)) {
            Notifications.gitNotFoundNotification();
        } else {
            Notifications.commonErrorNotification(e as Error, true);
        }
    }
    return '';
};
