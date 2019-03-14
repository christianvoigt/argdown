import { IArgdownPreviewState } from "./IArgdownPreviewState";
const defaultsDeep = require("lodash/defaultsDeep");
declare global {
  interface Window {
    initialState?: IArgdownPreviewState;
  }
}
const defaultState: IArgdownPreviewState = {
  dagre: {
    position: {}
  },
  vizJs: {
    position: {}
  },
  html: {
    line: 0
  }
};
export class ArgdownPreviewStore {
  private _vscode: any;
  private _state: IArgdownPreviewState;
  constructor(vscode: any) {
    this._vscode = vscode;
    const serializedState = this._vscode.getState();
    if (
      window.initialState &&
      serializedState &&
      window.initialState.resource !== serializedState.resource
    ) {
      this._state = defaultsDeep({}, window.initialState, defaultState);
    } else {
      this._state = defaultsDeep(
        {},
        serializedState,
        window.initialState,
        defaultState
      );
    }
    if (window.initialState && window.initialState.currentView) {
      this._state.currentView = window.initialState.currentView;
    }
    this._vscode.setState(this._state);
  }
  getState() {
    return this._state;
  }
  transformState(
    transformation: (oldState: IArgdownPreviewState) => IArgdownPreviewState
  ) {
    this._state = transformation(this._state);
    this._vscode.setState(this._state);
  }
}
