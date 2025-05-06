import { generateHeatMapColors, IndexedHeatMap, indexHeatColors } from './HeatMap';
import { BlamedDate, BlamedDocument } from './Blame';
import { isDarkTheme } from './Utils';
import Settings from './Settings';

class HeatMapManager {

    private heatMap: IndexedHeatMap = {};
    private heatColors: string[] = [];
    private isDarkTheme: boolean = isDarkTheme();

    constructor() {
        this.initHeatColors();
    }

    indexHeatMap(document: BlamedDocument[]) {
        this.heatMap = indexHeatColors(document, this.heatColors);
    }

    getHeatColor(date: BlamedDate) {
        return this.heatMap[date.dateString] || this.heatColors.at(-1);
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
