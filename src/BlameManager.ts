/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { calculateDecorationsWidth, DEFAULT_WIDTH, getDecorations, LEFT_SIDE, RIGHT_SIDE } from './DecorationUtils';
import HeatMapManager from './HeatMapManager';
import { BlamedDate, BlamedDocument, blame, emptyBlame } from './Blame';
import { getFilename } from './Utils';
import ExtensionManager from './ExtensionManager';
import { blameFile } from './Git';
import { log } from './Logger';

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
    private heatMapManager = new HeatMapManager();
    private width: string = DEFAULT_WIDTH;

    async toggleBlame(editor: vscode.TextEditor) {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            log.trace('Open blame start');
            ExtensionManager.setBusy(true);
            this.blamedDocument = await blame(editor.document);
            this.width = calculateDecorationsWidth(this.blamedDocument);
        
            if (this.blamedDocument.length > 0) {
                this.heatMapManager.indexHeatMap(this.blamedDocument);
                this.applyDecorations(editor, editor.document, true);
            } else {
                this.isOpen = false;
            }
            log.trace('Open blame end');
            ExtensionManager.setBusy(false);
        } else {
            this.setDecorations(editor, [], []);
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
        }
    }

    closeBlame() {
        this.isOpen = false;
        const editor = vscode.window.activeTextEditor;
        this.setDecorations(editor, [], []);
    }

    getBlameAt(line: number) {
        return this.blamedDocument[line];
    }

    getBlameColor(date: BlamedDate) {
        return this.heatMapManager.getHeatColor(date);
    }

    get decorationWidth() {
        return this.width;
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
        const changedLines = event.document.lineCount - this.blamedDocument.length;
        if (event.contentChanges.length > 0 && changedLines > 0) {
            if (changedLines === 1) {
                event.contentChanges.forEach(change => {
                    if (change.text.length > 0) {
                        this.blamedDocument.splice(change.range.start.line + 1,  0, emptyBlame());
                    }
                });
            } else {
                const change = event.contentChanges.find(change => change.text.length > 0)!;
                for (let l = 0; l < changedLines; l++) {
                    this.blamedDocument.splice(change.range.start.line + l, 0, emptyBlame());
                }
            }
        } else if (event.contentChanges.length > 0 && changedLines < 0) {
            const change = event.contentChanges.find(change => change?.text === '' && change.range.start.line < change.range.end.line);
            for (let line = change?.range.end.line!; line > change?.range.start.line!; line--) {
                this.blamedDocument.splice(line + 1, 1);
            }
        } else if (event.contentChanges.length > 0 && changedLines === 0) {
            event.contentChanges.forEach(change => {
                if (change.text.length > 0) {
                    this.blamedDocument.splice(change.range.start.line, 1, emptyBlame());
                }
            });
        } else {
            // Work around the VS Code bug where the 'onDidChangeTextDocument' event sometimes doesn't fire correctly
            // when a file is opened for the first time
            this.fixDirtyLines(event.document);
        }
    }

    private applyDecorations(editor: vscode.TextEditor, document: vscode.TextDocument, fresh?: boolean) {
        const nameOptions: vscode.DecorationOptions[] = [];
        const dateOptions: vscode.DecorationOptions[] = [];

        if (this.blamedDocument.length > 0) {
            if (fresh) {
                this.blamedDocument.push(emptyBlame());

                if (document.isDirty) {
                    this.fixDirtyLines(document);
                }
            }

            log.trace('Apply decorations');
            for (let i = 0; i < document.lineCount; i++) {
                const [name, date] = getDecorations(document.lineAt(i).range, this.getBlameAt(i), this);

                nameOptions.push(name);
                dateOptions.push(date);
            }
        }

        this.setDecorations(editor, nameOptions, dateOptions);
    }

    private fixDirtyLines(document: vscode.TextDocument) {
        const dirtyLines = document.getText().split('\n');
        const dirtyMax = dirtyLines.length - this.blamedDocument.length;
        let dirty = 0;

        dirtyLines.forEach((line, i) => {
            if (this.blamedDocument[i]?.codeline?.trim() !== line.trim() && dirty < dirtyMax) {
                this.blamedDocument.splice(i, 0, emptyBlame());
                dirty++;
            } else if (this.blamedDocument[i]?.codeline?.trim() !== line.trim() && dirty > dirtyMax) {
                this.blamedDocument.splice(i, 1);
                dirty--;
            }
        });
    }

    private setDecorations(editor: vscode.TextEditor | undefined, left: vscode.DecorationOptions[], right: vscode.DecorationOptions[]) {
        editor?.setDecorations(LEFT_SIDE, left);
        editor?.setDecorations(RIGHT_SIDE, right);
    }
}

export default BlameManager;
