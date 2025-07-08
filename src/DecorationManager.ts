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

    private defaultStyle: vscode.ThemableDecorationAttachmentRenderOptions = {
        color: new vscode.ThemeColor('editor.foreground'),
        height: 'editor.lineHeight',
        fontStyle: 'normal',
        fontWeight: 'normal'
    };
    private nameRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        before: this.defaultStyle
    });
    private dateRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            ...this.defaultStyle,
            margin: '0 10px 0 0',
        }
    });
    private createHoverMessage = this.createNormalMessage;
    private heatMapManager: HeatMapManager;
    private defaultWidth = 10;

    constructor(heatmapManager: HeatMapManager) {
        this.heatMapManager = heatmapManager;
    }

    calculateDefaultWidth(blamed: BlamedDocument[]) {
        this.defaultWidth = blamed.filter(line => line.hash !== '0')
        .map(line => line.author.displayName.length)
        .reduce((prev, curr) => prev > curr ? prev : curr, 0);
    }

    public refresh() {
        switch (Settings.getHoverStyle()) {
            case 'normal':
                this.createHoverMessage = this.createNormalMessage;
            case 'minimal':
                this.createHoverMessage = this.createMinimalMessage;
        }
    }

    public getDecorationOptions(range: vscode.Range, blamedDocument: BlamedDocument) {
        if (blamedDocument?.hash !== '0') {
            return [
                {
                    range,
                    renderOptions: {
                        before: {
                            contentText: `\u2003${blamedDocument.author.displayName}`,
                            backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
                            width: `${this.defaultWidth * 9 + 25}px`
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
        } else if (blamedDocument?.hash === '0') {
            return [
                {
                    range,
                    renderOptions: {
                        before: {
                                    contentText: '\u2003',
                                    width: `${this.defaultWidth * 9 + 25}px`
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

    public clear(editor = vscode.window.activeTextEditor) {
        editor?.setDecorations(this.nameRoot, []);
        editor?.setDecorations(this.dateRoot, []);
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
