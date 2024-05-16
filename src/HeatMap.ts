import * as vscode from "vscode";
import { BlamedDocument, BlamedDate } from "./Blame";

export interface IndexedHeatMap {
  	[key: string]: string | vscode.ThemeColor;
}

export const HEAT_MAP_COLORS = [
	// '#ff3333', // 2 up 60%
	// '#ff1a1a', // 1 up 55%
	"#ff0000", // defualt 50%
	"#e60000",
	"#cc0000",
	"#b30000",
	"#990000",
	"#800000",
	"#660000",
	"#4d0000",
	"#330000",
	"#1a0000",
	"#000000", // new vscode.ThemeColor('editor.background') //'#000000'
];

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
