/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDocument } from './Blame';
import Settings from './Settings';
import { prependSpace } from './Date';
import HeatMapManager from './HeatMapManager';

type BlameDecoration = [vscode.DecorationOptions, vscode.DecorationOptions];

class DecorationManager {

    private createHoverMessage = this.createNormalMessage;
    private heatMapManager: HeatMapManager;
    private defaultWidth = '70px';

    constructor(heatmapManager: HeatMapManager) {
        this.refresh();
        this.heatMapManager = heatmapManager;
    }

    public calculateDefaultWidth(blamed: BlamedDocument[]) {
        this.defaultWidth = `${blamed.filter(line => line.hash !== '0')
            .map(line => line.author.displayName.length)
            .reduce((prev, curr) => prev > curr ? prev : curr, 0) * 9 + 25}px`;
    }

    public refresh() {
        switch (Settings.getHoverStyle()) {
            default:
            case 'normal':
                this.createHoverMessage = this.createNormalMessage;
                break;
            case 'minimal':
                this.createHoverMessage = this.createMinimalMessage;
                break;
        }
    }

    public getDecorationOptions(range: vscode.Range, blamedDocument: BlamedDocument): BlameDecoration {
        if (blamedDocument?.hash !== '0') {
            return [
                {
                    range,
                    renderOptions: {
                        before: {
                            contentText: `\u2003${blamedDocument.author.displayName}`,
                            backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
                            width: this.defaultWidth
                        }
                    },
                    hoverMessage: this.createHoverMessage(blamedDocument)
                },
                {
                    range,
                    renderOptions: {
                        before: {
                            contentText: `${blamedDocument.date.localDate}\u2003`,
                            backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
                        }
                    }
                }
            ];
        } else {
            return [
                {
                    range,
                    renderOptions: {
                        before: {
                            contentText: '\u2003',
                            width: this.defaultWidth
                        },
                    }
                },
                {
                    range,
                    renderOptions:{ 
                        before: {
                            contentText: `${prependSpace('')}\u2003`                    
                        }
                    }
                }
            ];
        }
    }

    private createNormalMessage(blame: BlamedDocument): vscode.MarkdownString {
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

    private createMinimalMessage(blame: BlamedDocument): vscode.MarkdownString {
        return this.trustedMdString()
            .appendMarkdown(`[${blame.hash}](${vscode.Uri.parse(`command:simply-blame.copyCommit?${JSON.stringify([{ hash: blame.hash }])}`)})`)
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
