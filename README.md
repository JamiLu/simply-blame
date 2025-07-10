# SB - Simply Blame [![build and test](https://github.com/JamiLu/simply-blame/actions/workflows/run-tests.yml/badge.svg)](https://github.com/JamiLu/simply-blame/actions/workflows/run-tests.yml)

Idea like git blame annotations for VS Code!

## Steps to use
1. Install the extension
2. Press **Alt + B** on the text editor
3. You will see who to blame

### Screenshots
![Dark RGB Colors](dark-rgb-colors.png)
![Light RGB Colors](light-rgb-colors.png)
![Blame gif](blame.gif)

**If you click the commit hash on the hover info box the commit hash will be copied to clipboard**

![Minimal hover annotation](minimal-details.png)

**A minimal details box is an alternative to the normal which displays full details.**

## Settings
 * **Date Format**
   * System will use the locale used by the VS Code.
   * Or you can choose any other pre existing date format to use.
* **Author Style**
   * Select an author style for the blame annotations. Supported styles are full name, first name, last name.
* **Hover Style**
   * Select a blame annotation hover detail box style. Options are normal and minimal.
* **Heat Color Index Strategy**
   * Choose how the heat colors are shown. Scale through the commits, this is the default or highlight the latest commits.
* **Use RGBColor**
   * If selected the RGBColors dark and light lists are used. This is the default.
   * Otherwise the hex color list will be used.
* **Heat Map RGBColors List Dark** & **Heat Map RGBColors List Light**
   * Add, edit, choose a color to be used as a heat color.
   * Color must in format rNUM,gNUM,bNUM,cNUM
   * Choose a color by setting it as true. The first matching true will be used or if nothing is matching the first is used.
* **Heat Map Colors Dark** & **Heat Map Colors Light**
   * Configure and change colors of the heat map hex color list.
   * The top is hot and the bottom is cool.
* **Enable Open Blame Editor** *This setting is likely to be removed in future releases*
   * Select to enable a command to open a blame file in a new text editor tab, disabled by default.
   * The enabled command will show up on the context menu of the active text editor tab.

### How to find extension settings
![How to find settings](settings.gif)
