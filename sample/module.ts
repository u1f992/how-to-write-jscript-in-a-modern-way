export class Hoge {
    private fuga: number;
    constructor(fuga: number) {
        this.fuga = fuga;
    }
    echo(): void {
        WScript.Echo(`ふが = ${this.fuga}`);
    }
}
