import { IArgdownSettings } from "./IArgdownSettings";
import { workspace, WorkspaceConfiguration, Disposable } from "vscode";
import {
  LanguageClient,
  CancellationToken,
  DidChangeConfigurationNotification,
  Proposed
} from "vscode-languageclient";

export class LanguageServerConfiguration {
  private configurationListener: Disposable | undefined;
  private client: LanguageClient | undefined;

  // Convert VS Code specific settings to a format acceptable by the server. Since
  // both client and server do use JSON the conversion is trivial.
  computeConfiguration(
    params: Proposed.ConfigurationParams,
    _token: CancellationToken,
    _next: Function
  ): any[] {
    if (!params.items) {
      return [];
    }
    let result: (IArgdownSettings | null)[] = [];
    for (let item of params.items) {
      // The server asks the client for configuration settings without a section
      // If a section is present we return null to indicate that the configuration
      // is not supported.
      if (item.section) {
        result.push(null);
        continue;
      }
      let config: WorkspaceConfiguration;
      if (item.scopeUri && this.client) {
        config = workspace.getConfiguration(
          "argdown",
          this.client.protocol2CodeConverter.asUri(item.scopeUri)
        );
      } else {
        config = workspace.getConfiguration("argdown");
      }
      result.push({
        configFile: config.get("configFile")
      });
    }
    return result;
  }
  initialize(client: LanguageClient) {
    // VS Code currently doesn't sent fine grained configuration changes. So we
    // listen to any change. However this will change in the near future.
    this.client = client;
    this.configurationListener = workspace.onDidChangeConfiguration(() => {
      client.sendNotification(DidChangeConfigurationNotification.type, {
        settings: null
      });
    });
  }
  dispose() {
    if (this.configurationListener) {
      this.configurationListener.dispose();
    }
  }
}
