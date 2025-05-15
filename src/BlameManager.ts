/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import DecorationManager from './DecorationManager';
import HeatMapManager from './HeatMapManager';
import { BlamedDocument, blame, blameFile } from './Blame';
import { getFilename } from './Utils';
import { prependSpace } from './Date';

type BlameDecoration = [vscode.ThemableDecorationAttachmentRenderOptions?, vscode.ThemableDecorationAttachmentRenderOptions?, vscode.MarkdownString?];

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
    private defaultWidth: number = 10;
    private heatMapManager = new HeatMapManager();
    private decorationManager = new DecorationManager();
    private nameRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            color: new vscode.ThemeColor('editor.foreground'),
            height: 'editor.lineHeight',
            fontStyle: 'normal',
            fontWeight: 'normal'
        }
    });
    private dateRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        before: {
            color: new vscode.ThemeColor('editor.foreground'),
            height: 'editor.lineHeight',
            margin: '0 10px 0 0',
            fontStyle: 'normal',
            fontWeight: 'normal'
        }
    });

    async toggleBlame(editor: vscode.TextEditor) {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.blamedDocument = await blame(editor.document);
            this.defaultWidth = this.blamedDocument
                .filter(line => line.hash !== '0')
                .map(line => line.author.displayName.length)
                .reduce((prev, curr) => prev > curr ? prev : curr, 0);
        
            if (this.blamedDocument.length > 0) {
                this.heatMapManager.indexHeatMap(this.blamedDocument);

                const [name, date] = this.getBlamedDecorations(editor.document, true);
                editor.setDecorations(this.nameRoot, name);
                editor.setDecorations(this.dateRoot, date);
            } else {
                this.isOpen = false;
            }
        } else {
            editor.setDecorations(this.nameRoot, []);
            editor.setDecorations(this.dateRoot, []);
        }
    }

    refresh(event?: vscode.TextDocumentChangeEvent) {
        if (this.isOpen) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                if (event) {
                    this.editBlamedDocument(event);
                    const [name, date] = this.getBlamedDecorations(event.document);
                    editor.setDecorations(this.nameRoot, name);
                    editor.setDecorations(this.dateRoot, date);
                } else {
                    this.heatMapManager.refreshColors();
                    this.heatMapManager.indexHeatMap(this.blamedDocument);
                    const [name, date] = this.getBlamedDecorations(editor.document);
                    editor.setDecorations(this.nameRoot, name);
                    editor.setDecorations(this.dateRoot, date);
                }
            }
        } else {
            this.heatMapManager.initHeatColors();
        }
    }

    closeBlame() {
        this.isOpen = false;
        const editor = vscode.window.activeTextEditor;
        editor?.setDecorations(this.nameRoot, []);
        editor?.setDecorations(this.dateRoot, []);
    }

    async openBlameEditor(editor: vscode.TextEditor) {
        const blamedContent = await blameFile(editor.document.fileName);

        const panel = vscode.window.createWebviewPanel('blame', `Blame - ${getFilename(editor.document.uri.path)}`, vscode.ViewColumn.Beside);

        panel.webview.html = this.getHtmlForEditor(blamedContent);
    }

    private getHtmlForEditor(content: string) {
        return `<!DOCTYPE html>
<html>
	<body>
		<div style="white-space: pre">
${content}
		</div>
	<body>
</html>`;
    }

    private editBlamedDocument(event: vscode.TextDocumentChangeEvent) {
        const add = event.contentChanges.find(change => change?.text.match(/\n/) && change?.range.start.line === change.range.end.line);
        const remove = event.contentChanges.find(change => change?.text === '' && change.range.start.line < change.range.end.line);
        if (add) {
            this.blamedDocument.splice(add.range.start.line + 1, 0, { hash: '0' } as BlamedDocument);
        } else if (remove) {
            this.blamedDocument.splice(remove.range.start.line + 1, 1);
        }
    }

    private createDecorations(lineIdx: number, contentLineDefaultLength: number): BlameDecoration {
        const blamedDocument = this.blamedDocument[lineIdx];

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
                this.decorationManager.createHoverMessage(blamedDocument)
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

    private getBlamedDecorations(document: vscode.TextDocument, fresh?: boolean) {
        const nameDecorations: vscode.DecorationOptions[] = [];
        const dateDecorations: vscode.DecorationOptions[] = [];

        if (this.blamedDocument.length > 0) {
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const range = line.range;

                if (fresh && line.text.trim() !== this.blamedDocument[i]?.codeline.trim()) {
                    this.blamedDocument.splice(i, 0, { hash: '0' } as BlamedDocument);
                }

                const [name, date, hoverMessage] = this.createDecorations(i, this.defaultWidth);
					
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

        return [nameDecorations, dateDecorations];
    };
}

export default BlameManager;
