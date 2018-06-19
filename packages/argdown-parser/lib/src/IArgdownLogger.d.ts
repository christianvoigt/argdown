export interface IArgdownLogger {
    log: (level: string, message: string) => void;
    setLevel: (level: string) => void;
}
