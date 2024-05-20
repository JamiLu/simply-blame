import * as vscode from 'vscode';

class Settings {

    private static conf = 'simplyblame';

    static getHeatMapColors(): string[] {
        return vscode.workspace.getConfiguration(this.conf).heatMapColors;
    }

    static isEnableOpenBlameEditor(): boolean {
        return vscode.workspace.getConfiguration(this.conf).enableOpenBlameEditor;
    }

    static getDateLocale(): string {
        const lang = vscode.workspace.getConfiguration(this.conf).dateLocale;
        switch (lang) {
            case 'english':
                return 'en-EN';
            case 'finnish':
            default:
                return 'fi-FI';
        }
    }
}

export default Settings;
