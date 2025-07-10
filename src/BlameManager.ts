/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import DecorationManager from './DecorationManager';
import HeatMapManager from './HeatMapManager';
import { BlamedDocument, blame, blameFile } from './Blame';
import { getFilename } from './Utils';

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
    private heatMapManager = new HeatMapManager();
    private decorationManager = new DecorationManager(this.heatMapManager);
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
            this.decorationManager.calculateDefaultWidth(this.blamedDocument);
        
            if (this.blamedDocument.length > 0) {
                this.heatMapManager.indexHeatMap(this.blamedDocument);
                this.applyDecorations(editor, editor.document, true);
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
                    this.applyDecorations(editor, event.document);
                } else {
                    this.heatMapManager.refreshColors();
                    this.heatMapManager.indexHeatMap(this.blamedDocument);
                    this.applyDecorations(editor, editor.document);
                }
            }
        } else {
            this.heatMapManager.initHeatColors();
            this.decorationManager.refresh();
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

    private applyDecorations(editor: vscode.TextEditor, document: vscode.TextDocument, fresh?: boolean) {
        const nameOptions: vscode.DecorationOptions[] = [];
        const dateOptions: vscode.DecorationOptions[] = [];

        if (this.blamedDocument.length > 0) {
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const range = line.range;

                if (fresh && line.text.trim() !== this.blamedDocument[i]?.codeline.trim()) {
                    this.blamedDocument.splice(i, 0, { hash: '0' } as BlamedDocument);
                }

                const [name, date] = this.decorationManager.getDecorationOptions(range, this.blamedDocument[i]);

                nameOptions.push(name);
                dateOptions.push(date);
            }
        }

        editor.setDecorations(this.nameRoot, nameOptions);
        editor.setDecorations(this.dateRoot, dateOptions);
    };
}

export default BlameManager;
