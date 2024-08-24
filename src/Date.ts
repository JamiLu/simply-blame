import * as vscode from "vscode";
import Settings from "./Settings";
import moment = require("moment");

export const parseDate = (date: Date) => {
  const dateFormat = Settings.getDateFormat();
  if (dateFormat === "system") {
    return date.toLocaleDateString(vscode.env.language);
  }

  return moment(date).format(dateFormat);
};
