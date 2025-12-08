/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { isDarkTheme } from './Utils';

class Settings {

    static config = 'simplyblame';

    static getHeatMapColors(): string[] {
        if (isDarkTheme()) {
            return vscode.workspace.getConfiguration(this.config).heatMapColorsDark;
        } else {
            return vscode.workspace.getConfiguration(this.config).heatMapColorsLight;
        }
    }

    static isEnableOpenBlameEditor(): boolean {
        return vscode.workspace.getConfiguration(this.config).enableOpenBlameEditor;
    }

    static getDateFormat(): string {
        return vscode.workspace.getConfiguration(this.config).dateFormat;
    }

    static getHeatColorIndexStrategy(): ('scale' | 'highlight') & string {
        return vscode.workspace.getConfiguration(this.config).heatColorIndexStrategy;
    }

    static useRGBColors(): boolean {
        return vscode.workspace.getConfiguration(this.config).useRGBColor;
    }

    static getHeatMapRGBColor(): {r: number, g: number, b: number, c: number } {
        let color;
        let obj;
        if (isDarkTheme()) {
            obj = vscode.workspace.getConfiguration(this.config).heatMapRGBColorsDarkList;
        } else {
            obj = vscode.workspace.getConfiguration(this.config).heatMapRGBColorsLightList;
        }

        color = Object.entries(obj).find(([key, val]) => val && key)?.[0];
        if (!color) {
            color = Object.entries(obj)[0][0];
        }
        
        const [, r, g, b, c ] = color.match(/r(\d+),g(\d+),b(\d+),c(\d)/) || [];
        return { r: Number(r), g: Number(g), b: Number(b), c: Number(c) };
    }

    static getAuthorStyle(): ('full' | 'first' | 'last') & string {
        return vscode.workspace.getConfiguration(this.config).authorStyle;
    }

    static getHoverStyle(): ('normal' | 'minimal') & string {
        return vscode.workspace.getConfiguration(this.config).hoverStyle;
    }

    static getHashAction(): ('copy' | 'remote') & string {
        return vscode.workspace.getConfiguration(this.config).hashAction;
    }

    static isKeepBlamesOpen(): boolean {
        return vscode.workspace.getConfiguration(this.config).keepBlamesOpen;
    }
    
}

export default Settings;
