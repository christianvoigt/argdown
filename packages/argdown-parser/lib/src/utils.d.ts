import { IAstNode } from "./model/model";
export declare const escapeHtml: (str: string) => string;
export declare const validateLink: (url: string, allowFile: boolean) => boolean;
export declare const normalizeLink: (url: string) => string;
export declare const normalizeLinkText: (url: string) => string;
export declare const stringToHtmlId: (str: string) => string;
export declare const stringToClassName: (str: string) => string;
export declare const getHtmlId: (type: string, title: string, htmlIdsSet?: {
    [id: string]: boolean;
} | undefined) => string;
export declare const reduceToMap: <K, V extends object>(a: V[], idProvider: (curr: V) => K) => Map<K, V>;
export declare const tokensToString: (tokens: any[]) => string;
export declare const tokenLocationsToString: (tokens: any[]) => string;
export declare const astToString: (ast: IAstNode) => string;
export declare const astToJsonString: (ast: IAstNode[]) => string;
