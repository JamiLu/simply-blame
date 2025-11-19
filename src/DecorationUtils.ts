/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDocument } from './Blame';
import { prependSpace } from './Date';
import { log } from './Logger';
import BlameManager from './BlameManager';

type BlameDecoration = [vscode.DecorationOptions, vscode.DecorationOptions];

const baseDecorations: vscode.ThemableDecorationRenderOptions = {
    before: {
        color: new vscode.ThemeColor('editor.foreground'),
        height: 'editor.lineHeight',
        fontStyle: 'normal',
        fontWeight: 'normal'
    }
};

export const LEFT_SIDE: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType(baseDecorations);
export const RIGHT_SIDE: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
    before: {
        ...baseDecorations.before,
        margin: '0 10px 0 0',
    }
});

export const DEFAULT_WIDTH = '70px';

export const calculateDecorationsWidth = (blamed: BlamedDocument[]): string => {
    log.trace('Calculate width started');
    const width = `${blamed.filter(line => line.hash !== '0')
        .map(line => line.author.displayName.length)
        .reduce((prev, curr) => prev > curr ? prev : curr, 0) * 9 + 25}px`;
    log.trace('Calculated width', width);
    return width;
};

export const getDecorations = (range: vscode.Range, blamedDocument: BlamedDocument, blameManager: BlameManager): BlameDecoration => {
    if (blamedDocument?.hash !== '0') {
        return [
            {
                range,
                renderOptions: {
                    before: {
                        contentText: `\u2003${blamedDocument.author.displayName}`,
                        backgroundColor: blameManager.getBlameColor(blamedDocument.date),
                        width: blameManager.decorationWidth
                    }
                },
            },
            {
                range,
                renderOptions: {
                    before: {
                        contentText: `${blamedDocument.date.localDate}\u2003`,
                        backgroundColor: blameManager.getBlameColor(blamedDocument.date),
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
                        width: blameManager.decorationWidth
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
};

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
