/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';

class Logger {

    private static logger: Logger;
    private channel: vscode.LogOutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel('Simply Blame', { log: true });    
    }

    get log() {
        return this.channel;
    }

    dispose() {
        this.channel.dispose();
    }

    static get instance() {
        if (!this.logger) {
            this.logger = new Logger();
        }
        return this.logger;
    }
}

export default Logger.instance;

const log = Logger.instance.log;

export { log };
