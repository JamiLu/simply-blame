import { IndexedHeatMap, indexHeatColors } from './HeatMap';
import { BlamedDate, BlamedDocument } from './Blame';
import { isDarkTheme } from './Utils';
import Settings from './Settings';

class HeatMapManager {

    private heatMap: IndexedHeatMap = {};
    private heatColors: string[];
    private isDarkTheme: boolean = isDarkTheme();

    constructor() {
        this.heatColors = Settings.getHeatMapColors();
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
            this.heatColors = Settings.getHeatMapColors();
            this.isDarkTheme = nextTheme;
        }
    }
    
}

export default HeatMapManager;
