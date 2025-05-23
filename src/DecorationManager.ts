/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDocument } from './Blame';

class DecorationManager {

    public createHoverMessage(blame: BlamedDocument): vscode.MarkdownString {
        return this.trustedMdString()
            .appendMarkdown(`$(account) &nbsp; ${blame.author.name}`)
            .appendText('\n')
            .appendMarkdown(`$(mail) &nbsp; ${blame.email}`)
            .appendText('\n')
            .appendMarkdown(`$(calendar) &nbsp; ${blame.date.localDate.trim()} ${blame.date.timeString}`)
            .appendText('\n')
            .appendMarkdown('***')
            .appendText('\n')
            .appendMarkdown(`[$(copy) &nbsp; ${blame.hash}](${vscode.Uri.parse(`command:simply-blame.copyCommit?${JSON.stringify([{ hash: blame.hash }])}`)})`)
            .appendText('\n')
            .appendMarkdown(`****\n`)
            .appendMarkdown(`${blame.summary}`);
    }

    private trustedMdString() {
        const str = new vscode.MarkdownString();
        str.supportThemeIcons = true;
        str.isTrusted = { enabledCommands: ['simply-blame.copyCommit'] };
        return str;
    }

}

export default DecorationManager;
