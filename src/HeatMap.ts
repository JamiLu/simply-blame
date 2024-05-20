import * as vscode from "vscode";
import { BlamedDocument, BlamedDate } from "./Blame";
import Settings from "./Settings";

export interface IndexedHeatMap {
  	[key: string]: string | vscode.ThemeColor;
}

export const HEAT_MAP_COLORS = Settings.getHeatMapColors();

const toDistinctDates = (prev: BlamedDate[], curr: BlamedDate) => {
	if (!prev.find((date) => date.dateString === curr.dateString)) {
		prev.push(curr);
	}
	return prev;
};

export const indexHeatColors = (blamedDocument: BlamedDocument[]): IndexedHeatMap => {
	const distinctDates = blamedDocument
		.filter(Boolean)
		.map((doc) => doc.date)
		.reduce(toDistinctDates, [] as BlamedDate[]);
		
	distinctDates.sort((a, b) => b.dateMillis - a.dateMillis);

	const indexedHeatMap = {} as IndexedHeatMap;

	distinctDates.forEach((date, idx) => {
		if (idx < HEAT_MAP_COLORS.length) {
			indexedHeatMap[date.dateString] = HEAT_MAP_COLORS[idx];
		}
	});

	return indexedHeatMap;
};

export const getHeatColor = (date: BlamedDate, heatMap: IndexedHeatMap) => {
	return (
		heatMap[date.dateString] || HEAT_MAP_COLORS[HEAT_MAP_COLORS.length - 1]
	);
};
