/**
 * [[IArgdownPlugin]] implementations are expected to check in their [[IArgdownPlugin.prepare]] method
 * that all required data is available in the response object. If this is not the case, they should throw an
 * [[ArgdownPluginError]].
 */
export class ArgdownPluginError extends Error {
  /**
   * The name of the plugin throwing the error.
   */
  plugin: string;
  /**
   * The name of the processor the plugin is a part of.
   * Will be added automatically by [[ArgdownApplication]].
   */
  processor?: string;
  /**
   *
   * @param plugin the nname of the plugin throwing this error
   * @param message the reason why this error was thrown
   * @param e
   */
  constructor(plugin: string, message?: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.plugin = plugin;
  }
}
