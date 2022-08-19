import * as vsc from 'vscode';
import alignIndents from './commands/alignIndents';
import alignIndentSteps from './commands/alignIndentSteps';
import selectHarmfulSpaces from './commands/selectHarmfulSpaces';

export function activate(context: vsc.ExtensionContext) {
	const commands = [
		// vsc.commands.registerCommand('my-command', () => {}),
		// vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {}),
		vsc.commands.registerTextEditorCommand('align-indents.alignIndents', alignIndents),
		vsc.commands.registerTextEditorCommand('align-indents.alignIndentSteps', alignIndentSteps),
		vsc.commands.registerTextEditorCommand('align-indents.selectHarmfulSpaces', selectHarmfulSpaces),
	];

	context.subscriptions.push(...commands);
}

export function deactivate() {}