import * as vsc from "vscode";
import {
	searchInIndents,
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	offsetsToSelection,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
} from "../functions";

export {
	selectIndentSpacesBy1,
	selectIndentSpacesBy2,
	selectIndentSpacesBy3,
	selectIndentSpacesBy4,
	selectIndentSpacesBy5,
	selectIndentTabs,
	selectIndentSpacesByAuto,
	selectIndentsAuto
};

function selectIndentSpacesBy1(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, / /g);
}

function selectIndentSpacesBy2(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, /  /g);
}

function selectIndentSpacesBy3(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, /   /g);
}

function selectIndentSpacesBy4(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, /    /g);
}

function selectIndentSpacesBy5(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, /     /g);
}

function selectIndentTabs(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	selectBy(tEditor, edit, /\t/g);
}

function selectIndentSpacesByAuto(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		opts = tEditor.options,
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
			" ".repeat(opts.tabSize) : "\t",
		size:number = opts.tabSize as number;
	selectBy(tEditor, edit, new RegExp(` {${size}}`, "g"));
}

function selectIndentsAuto(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		opts = tEditor.options,
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
			" ".repeat(opts.tabSize) : "\t";
	selectBy(tEditor, edit, new RegExp(TAB, "g"));
}

function selectBy(
	tEditor: vsc.TextEditor, 
	edit: vsc.TextEditorEdit, 
	re: RegExp
) {
	const 
		doc  = tEditor.document,
		EOL  = ["", "\n", "\r\n"][doc.eol],
		newSelections: vsc.Selection[] = [];
	
	tEditor.edit((edit) => {
		for (let sel of tEditor.selections) {
			const 
				wholeStringsRange = getWholeLinesRange(doc, sel),
				startOffset = doc.offsetAt(wholeStringsRange.start),
				text = doc.getText(wholeStringsRange),
				harmfulSpaces: [number, number][] = searchInIndents(
					text, 
					EOL, 
					re, 
					startOffset
				);

			for (const offs of harmfulSpaces) {
				newSelections.push(offsetsToSelection(doc, offs));
			}
		}
		if (newSelections.length) {
			tEditor.selections = newSelections;
		} else {
			vsc.window.showInformationMessage("Nothing to select.");
		}
	});
}