/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { blameFile } from './Git';
import { getFilename } from './Utils';
import BlameManager from './BlameManager';
import Settings from './Settings';

class EditorManager {

    private static instance: EditorManager;

    private openEditors: Map<String, BlameManager> = new Map();
    private current: BlameManager | null = null;

    private constructor() {}

    get currentEditor() {
        return this.current!;
    }

    async toggleEditor(editor: vscode.TextEditor) {
        if (this.openEditors.get(editor.document.fileName)) {
            await this.openEditors.get(editor.document.fileName)?.toggleBlame(editor);
        } else {
            const manager = new BlameManager();
            manager.toggleBlame(editor);
            this.openEditors.set(editor.document.fileName, manager);
            this.current = manager;
        }
    }
    
    changeEditor(editor?: vscode.TextEditor) {
        if (!editor?.document.fileName) {
            return;
        }

        if (editor && !Settings.isKeepBlamesOpen()) {
            this.closeEditor(editor.document);
        }
    
        let nextEditor;
        if ((nextEditor = editor && this.getEditor(editor.document)) !== undefined) {
            nextEditor.restore();
            this.current = nextEditor;
        }
    }
    
    closeEditor(document: vscode.TextDocument) {
        this.getEditor(document)?.closeBlame();
    }
    
    disposeEditors() {
        const iterator = this.openEditors.entries();
        let next;
        while ((next = iterator.next().value) !== undefined) {
            next[1].closeBlame();
        }
    }
    
    getEditor(document: vscode.TextDocument): BlameManager | undefined {
        return this.openEditors.get(document.fileName);
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }
}

export default EditorManager;

export const openBlameEditor = async (editor: vscode.TextEditor) => {
    const blamedContent = await blameFile(editor.document.fileName);

    const panel = vscode.window.createWebviewPanel('blame', `Blame - ${getFilename(editor.document.uri.path)}`, vscode.ViewColumn.Beside);

    panel.webview.html = getHtmlForEditor(blamedContent);
};

function getHtmlForEditor(content: string) {
    return `<!DOCTYPE html>
<html>
<body>
    <div style="white-space: pre">
${content}
    </div>
<body>
</html>`;
};
