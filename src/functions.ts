import * as vsc from "vscode";

export {
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
};

function getWholeLinesRange(doc: vsc.TextDocument, range: vsc.Range): vsc.Range {
	const 
		text = doc.getText(),
		[a, b] = rangeToOffsets(doc, range),
		aa = getLineOffsets(text, a)[0],
		bb = getLineOffsets(text, b)[1],
		newRange = offsetsToRange(doc, [aa, bb]);
	return newRange;

}

function rangeToOffsets(doc: vsc.TextDocument, range: vsc.Range): [number, number] {
	return [range.start, range.end].map(doc.offsetAt) as [number, number];
}

function offsetsToRange(doc: vsc.TextDocument, offsets: [number, number]): vsc.Range {
	const [a, b] = offsets.map(doc.positionAt);
	return new vsc.Range(a, b);
}

function getLineOffsets(text: string, offset: number, eol: string ="\n"): [number, number] {
	let i: number, nextI: number, a: number, b: number;
	a = nextI = offset;
	while (text[i = nextI--]) {
		if (text.startsWith(eol, i)) {
			a = i + eol.length;
			break;
		}
	}
	b = nextI = offset;
	while (text[i = nextI++]) {
		if (text.startsWith(eol, i)) {
			b = i;
			break;
		}
	}
	return [a, b];
}

function separateIndent(line: string): [string, string] {
	const m = line.match(/^(\s*)(.*)$/);
	return m ? [m[1], m[2]] : ["", ""];
}

function getIndentOffset(indent: string, opts: vsc.TextEditorOptions): number {
	const tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1;
	return indent.replace(/\t/g, " ".repeat(tabSize)).length;
}