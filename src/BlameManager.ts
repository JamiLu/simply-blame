import * as vscode from 'vscode';
import DecorationManager from './DecorationManager';
import HeatMapManager from './HeatMapManager';
import { BlamedDocument, blame, blameFile } from './Blame';
import { getFilename } from './Utils';

type BlameDecoration = [vscode.ThemableDecorationAttachmentRenderOptions?, vscode.ThemableDecorationAttachmentRenderOptions?, vscode.MarkdownString?];

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
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
            if (this.blamedDocument.length > 0) {
                this.heatMapManager.indexHeatMap(this.blamedDocument);

                const [name, date] = this.getBlamedDecorations(editor.document.lineCount);
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

    refresh() {
        if (this.isOpen) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this.heatMapManager.refreshColors();
                this.heatMapManager.indexHeatMap(this.blamedDocument);
                const [name, date] = this.getBlamedDecorations(editor.document.lineCount);
                editor.setDecorations(this.nameRoot, name);
                editor.setDecorations(this.dateRoot, date);
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

    private createDecorations(lineIdx: number, contentLineDefaultLength: number): BlameDecoration {
        const blamedDocument = this.blamedDocument[lineIdx];

        if (blamedDocument) {
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
        } 
        return [];
    }

    private getBlamedDecorations(linecount: number) {

        const nameDecorations: vscode.DecorationOptions[] = [];

        const dateDecorations: vscode.DecorationOptions[] = [];

        const longestAuthor = this.blamedDocument.filter(Boolean).map(line => line.author.displayName.length).reduce((prev, curr) => prev > curr ? prev : curr, 0);

        if (this.blamedDocument.length > 0) {
            for (let i = 0; i < linecount; i++) {
                const startPos = new vscode.Position(i, 0);
                const endPos = new vscode.Position(i, 0);
                let range = new vscode.Range(startPos, endPos);

                const [name, date, hoverMessage] = this.createDecorations(i, longestAuthor);
					
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
