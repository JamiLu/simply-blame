/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { command } from './Command';
import Notifications from './Notifications';
import { getLocation } from './Utils';

export const getCommitMessage = async (document: vscode.TextDocument, commit: string) => {
    const location = getLocation(document.fileName);
    
    try {
        const body = await command(`cd ${location} && git show ${commit}`);

        const message = body?.substring(body.indexOf('\n\n'), body.search('diff --git'));

        return message?.replace(/^ {2,}/gm, '');
    } catch (e) {
        Notifications.commonErrorNotification(e as Error, true);
    }
};
