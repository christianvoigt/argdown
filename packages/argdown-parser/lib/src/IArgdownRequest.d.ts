/**
 * The basic request configuration data used by [[ArgdownApplication]] and the [[ParserPlugin]].
 *
 * Additional configuration data not included here is used by other plugins.
 * Plugins should define request interfaces that extend IArgdownRequest.
 * They can then simply cast the provided IArgdownRequest object to their own interface
 *  and retrieve the additional data.
 */
export interface IArgdownRequest {
    /**
     * The Argdown input that should be parsed.
     */
    input?: string;
    /**
     * If an array is used: the processors that should be executed in order by the [[ArgdownApplication]] during the current run.
     *
     * If a string is used: the name of the process to be found in [[IArgdownRequest.processes]]. ArgdownApplication will then try to run the processors defined in that process.
     */
    process?: string[] | string;
    /**
     * A dictionary of processes that can be run by using `run({process: "processName", input: ..., processes: ...})`.
     *
     * Keys are the process names, values are list of processors to be executed.
     */
    processes?: {
        [name: string]: string[];
    };
    /**
     * Set to "verbose" to get a lot of infos.
     */
    logLevel?: string;
    /**
     * Should exceptions thrown by plugins be logged?
     */
    logExceptions?: boolean;
}
