export interface IArgdownNode {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
    tokenType?: {
        tokenName: string;
    };
    name?: string;
    title?: string;
    argument?: any;
    statement?: any;
    children?: IArgdownNode[];
    tag?: string;
}
