/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { getCommitMessage } from './Git';
import { createMinimalMessage, createNormalMessage } from './DecorationUtils';
import Settings from './Settings';
import { ZERO_HASH } from './Blame';
import EditorManager from './Editor';

interface HoverCreator {
    createHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover> | undefined
}

class BlameHoverProvider implements vscode.HoverProvider {

    private hoverCreators: HoverCreator[];
    private hoverCreator: HoverCreator;

    constructor() {
        this.hoverCreators = [new NormalHoverCreator(), new MinimalHoverCreator()];
        this.hoverCreator = this.hoverCreators[0];
        this.refresh();
    }

    refresh() {
        switch (Settings.getHoverStyle()) {
            default:
            case 'normal':
                this.hoverCreator = this.hoverCreators[0];
                break;
            case 'minimal':
                this.hoverCreator = this.hoverCreators[1];
                break;
        }
    }

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover> | undefined {
        if (position.character === 0) {
            return this.hoverCreator.createHover(document, position);
        }   
    }
}

export default BlameHoverProvider;

class MinimalHoverCreator implements HoverCreator {

    private editorManager = EditorManager.getInstance();

    createHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover> | undefined  {
        const blame = this.editorManager.currentEditor.getBlameAt(position.line);

        if (blame.hash !== '0') {
            return Promise.resolve(new vscode.Hover(createMinimalMessage(blame), document.lineAt(position.line).range));
        }
    }

}

class NormalHoverCreator implements HoverCreator {

    private editorManager = EditorManager.getInstance();
    private lastCommit: string = '';
    private lastMsg: string | undefined;

    async wrapPromise<T>(method: () => Promise<T>) {
        return await method();
    }

    createHover(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Hover> {
        const blame = this.editorManager.currentEditor.getBlameAt(position.line);
        
        return this.wrapPromise(async () => {
            let message;

            if (this.lastCommit !== blame.hash && blame.hash !== '0' && blame.hash !== ZERO_HASH) {
                message = await getCommitMessage(document, blame.hash);
                this.lastMsg = message;
            } else if (this.lastCommit === blame.hash && blame.hash !== ZERO_HASH) {
                message = this.lastMsg;
            }

            this.lastCommit = blame.hash;

            return new vscode.Hover(createNormalMessage(blame, message), document.lineAt(position.line).range);
        });
    }
}
