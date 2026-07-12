export type PluginStatTotals = {
  author: string;
  name: string;
  downloads: number;
};

export abstract class IPluginStatsRepository {
  abstract incrementDownload(
    author: string,
    name: string,
    version: string,
  ): Promise<void>;
  abstract getAllTotals(): Promise<PluginStatTotals[]>;
}
