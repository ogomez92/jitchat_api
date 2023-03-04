import * as fs from "fs";

export default class StorageManager {
  private data;

  constructor() {
    if (!fs.existsSync("data.json")) {
      fs.writeFileSync("data.json", "{}");
    }

    this.data = JSON.parse(fs.readFileSync("data.json", "utf8"));
  }

  public async setKey(key: string, value: any): Promise<void> {
    this.data[key] = value;

    return await this.syncToFile();
  }

  private async syncToFile(): Promise<void> {
    return fs.writeFileSync("data.json", JSON.stringify(this.data));
  }

  public getKey(key: string): any {
    return this.data[key];
  }
}
