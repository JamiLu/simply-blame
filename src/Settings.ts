import * as vscode from 'vscode';

class Settings {

    private static conf = 'simplyblame';

    static getHeatMapColors(): string[] {
        if ([vscode.ColorThemeKind.Dark, vscode.ColorThemeKind.HighContrast].includes(vscode.window.activeColorTheme.kind)) {
            return vscode.workspace.getConfiguration(this.conf).heatMapColorsDark;
        } else {
            return vscode.workspace.getConfiguration(this.conf).heatMapColorsLight;
        }
    }

    static isEnableOpenBlameEditor(): boolean {
        return vscode.workspace.getConfiguration(this.conf).enableOpenBlameEditor;
    }

    static getDateFormat(): string {
        return vscode.workspace.getConfiguration(this.conf).dateFormat;
    }
}

export default Settings;
