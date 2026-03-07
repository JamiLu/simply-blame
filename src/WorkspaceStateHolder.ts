import * as vscode from 'vscode';

class WorkspaceStateHolder {

    private static instance: WorkspaceStateHolder;

    private _state: vscode.Memento;
    
    private constructor(state: vscode.Memento) {
        this._state = state;
    }

    public setIgnoreWhiteSpaceToggle() {
        this._state.update("ignoreWhiteSpace", !this.ignoreWhiteSpaceToggle);
    }

    public get ignoreWhiteSpaceToggle() {
        return this._state.get("ignoreWhiteSpace");
    }

    public static create(state: vscode.Memento) {
        if (!this.instance) {
            this.instance = new this(state);
        }
        return this.instance;
    }

    public static get state() {
        if (!this.instance) {
            throw new Error("Workspace state holder not created, call 'create' first");
        }
        return this.instance;
    }
}

export default WorkspaceStateHolder;
