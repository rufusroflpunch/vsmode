import * as vscode from 'vscode';
import { ModalState } from './state';
import { Mode } from './mode';
import * as utils from './utils';

export let commandRegistry = {
  "i": {
    repeatable: false,
    exec: (state: ModalState) => {
      // If the cursor is at the end of the selection instead of the front, swap the anchor and cursor
      let newSelection: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        if (selection.anchor.isBefore(selection.active)) {
          newSelection.push(new vscode.Selection(selection.active, selection.anchor));
        } else {
          newSelection.push(selection);
        }
      }
      vscode.window.activeTextEditor.selections = newSelection;
      state.setMode(Mode.Insert);
    }
  },
  "a": {
    repeatable: false,
    exec: (state: ModalState) => {
      // If the cursor is at the beginning of the selection instead of the end, swap the anchor and cursor
      let newSelection: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        if (selection.anchor.isEqual(selection.active)) {
          // If it's a single character selection, shift the cursor to the right
          const newPos = selection.active.with(selection.active.line, selection.active.character + 1);
          newSelection.push(new vscode.Selection(newPos, newPos));
        } else if (selection.anchor.isAfter(selection.active)) {
          newSelection.push(new vscode.Selection(selection.active, selection.anchor));
        } else {
          newSelection.push(selection);
        }
      }
      vscode.window.activeTextEditor.selections = newSelection;
      state.setMode(Mode.Insert);
    }
  },
  "h": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, false);
    }
  },
  "H": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, true);
    }
  },
  "l": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, false);
    }
  },
  "L": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, true);
    }
  },
  "j": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, false);
    }
  },
  "J": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, true);
    }
  },
  "k": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, false);
    }
  },
  "K": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, true);
    }
  },
  "w": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\w*\s*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "W": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\w*\s*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "e": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\s*\w*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "E": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\s*\w*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "b": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "B": {
    repeatable: true,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "f": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.resetCursor();
      state.setMode(Mode.CharacterFind);
    }
  },
  "F": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.setMode(Mode.CharacterFind);
    }
  },
  "findChar": {
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, true, forward);
      state.setMode(Mode.Selection);
    }
  },
  "t": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "T": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "toChar": {
    repeatable: false,
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, false, forward);
      state.setMode(Mode.Selection);
    }
  },
  "x": {
    repeatable: false,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('expandLineSelection');
    }
  },
  "X": {
    repeatable: false,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('expandLineSelection');
    }
  }
}