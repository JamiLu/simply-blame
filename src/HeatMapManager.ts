/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { BlamedDate, BlamedDocument } from './Blame';
import { generateHeatMapColors, IndexedHeatMap, indexHeatColors } from './HeatMap';
import Settings from './Settings';
import { isDarkTheme } from './Utils';

class HeatMapManager {

    private heatMap: IndexedHeatMap = new Map<number, string | vscode.ThemeColor>();
    private heatColors: string[] = [];
    private isDarkTheme: boolean = isDarkTheme();

    constructor() {
        this.initHeatColors();
    }

    indexHeatMap(document: BlamedDocument[]) {
        this.heatMap = indexHeatColors(document, this.heatColors);
    }

    getHeatColor(date: BlamedDate): string | vscode.ThemeColor {
        return this.heatMap.get(date.dateMillis) || this.getClosestColor(date);
    }

    // Find the closest color for a given date. Used when the date is not directly indexed 
    // e.g.: for uncommitted/unsaved changes.
    private getClosestColor(date: BlamedDate): string | vscode.ThemeColor {
        const sortedKeys = Array.from(this.heatMap.keys()).sort((a, b) => b - a);
        for (const key of sortedKeys) {
            if (key <= date.dateMillis) {
                return this.heatMap.get(key)!;
            }
        }
        return this.heatColors.at(-1)!;
    }

    refreshColors() {
        const nextTheme = isDarkTheme();
        if (this.isDarkTheme !== nextTheme) {
            this.initHeatColors();
            this.isDarkTheme = nextTheme;
        }
    }

    initHeatColors() {
        this.heatColors = Settings.useRGBColors() 
            ? generateHeatMapColors(Settings.getHeatMapRGBColor())
            : Settings.getHeatMapColors();
    }
    
}

export default HeatMapManager;
