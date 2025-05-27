/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDocument } from './Blame';
import Settings from './Settings';
import { prependSpace } from './Date';
import HeatMapManager from './HeatMapManager';

type BlameDecoration = [vscode.ThemableDecorationAttachmentRenderOptions?, vscode.ThemableDecorationAttachmentRenderOptions?, vscode.MarkdownString?];

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

    setDefaultWith(width: number) {
        this.defaultWidth = width;
    }

    public refresh() {
        switch (Settings.getHoverStyle()) {
            case 'normal':
                this.createHoverMessage = this.createNormalMessage;
            case 'minimal':
                this.createHoverMessage = this.createMinimalMessage;
        }
    }

    public create(document: vscode.TextDocument, blamedDocument: BlamedDocument[], fresh?: boolean) {
        const nameDecorations: vscode.DecorationOptions[] = [];
        const dateDecorations: vscode.DecorationOptions[] = [];

        if (blamedDocument.length > 0) {
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const range = line.range;

                if (fresh && line.text.trim() !== blamedDocument[i]?.codeline.trim()) {
                    blamedDocument.splice(i, 0, { hash: '0' } as BlamedDocument);
                }

                const [name, date, hoverMessage] = this.createDecorations(blamedDocument[i], this.defaultWidth);
					
                nameDecorations.push({
                    range,
                    renderOptions: {
                        before: name
                    },
                    hoverMessage: hoverMessage
                });

                dateDecorations.push({
                    range,
                    renderOptions: {
                        before: date
                    },
                });
            }
        }

        

        // return [nameDecorations, dateDecorations];
    }

    private createDecorations(blamedDocument: BlamedDocument, contentLineDefaultLength: number): BlameDecoration {
        if (blamedDocument?.hash !== '0') {
            return [
                {
                    contentText: `\u2003${blamedDocument.author.displayName}`,
                    backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
                    width: `${contentLineDefaultLength * 9 + 25}px`
                },
                {
                    contentText: `${blamedDocument.date.localDate}\u2003`,
                    backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
                },
                this.createHoverMessage(blamedDocument)
            ];
        } else if (blamedDocument?.hash === '0') {
            return [
                {
                    contentText: '\u2003',
                    width: `${contentLineDefaultLength * 9 + 25}px`
                }, 
                {
                    contentText: `${prependSpace('')}\u2003`
                }
            ];
        }
        return [];
    }

    public clear() {
        const editor = vscode.window.activeTextEditor;
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
