/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDocument } from './Blame';
import { prependSpace } from './Date';
import HeatMapManager from './HeatMapManager';
import { log } from './Logger';

type BlameDecoration = [vscode.DecorationOptions, vscode.DecorationOptions];

class DecorationManager {

    private heatMapManager: HeatMapManager;
    private defaultWidth = '70px';

    constructor(heatmapManager: HeatMapManager) {
        this.heatMapManager = heatmapManager;
    }

    public calculateDefaultWidth(blamed: BlamedDocument[]) {
        log.trace('Calculate width started');
        this.defaultWidth = `${blamed.filter(line => line.hash !== '0')
            .map(line => line.author.displayName.length)
            .reduce((prev, curr) => prev > curr ? prev : curr, 0) * 9 + 25}px`;
        log.trace('Calculated width', this.defaultWidth);
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

}

export default DecorationManager;

const trustedMdString = () => {
    const str = new vscode.MarkdownString();
    str.supportThemeIcons = true;
    str.isTrusted = { enabledCommands: ['simply-blame.hashAction'] };
    return str;
};

export const createNormalMessage = (blame: BlamedDocument, fullBody?: string): vscode.MarkdownString  => {
    return trustedMdString()
        .appendMarkdown(`$(account) &nbsp; ${blame.author.name}`)
        .appendText('\n')
        .appendMarkdown(`$(mail) &nbsp; ${blame.email}`)
        .appendText('\n')
        .appendMarkdown(`$(calendar) &nbsp; ${blame.date.localDate.trim()} ${blame.date.timeString}`)
        .appendText('\n')
        .appendMarkdown('***')
        .appendText('\n')
        .appendMarkdown(`[$(copy) &nbsp; ${blame.hash}](${vscode.Uri.parse(`command:simply-blame.hashAction?${JSON.stringify([{ hash: blame.hash }])}`)})`)
        .appendText('\n')
        .appendMarkdown(`****\n`)
        .appendText(`${fullBody ?? blame.summary}`);
};

export const createMinimalMessage = (blame: BlamedDocument): vscode.MarkdownString => {
    return trustedMdString()
        .appendMarkdown(`[${blame.hash}](${vscode.Uri.parse(`command:simply-blame.hashAction?${JSON.stringify([{ hash: blame.hash }])}`)})`)
        .appendText('\n')
        .appendMarkdown(`****\n`)
        .appendMarkdown(`${blame.summary}`);
};
