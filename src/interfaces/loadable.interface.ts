export interface ILoadable {
    load(fileName: string): Promise<void>;
    save(fileName: string): void;
}
