export type PluginStatTotals = {
  author: string;
  name: string;
  downloads: number;
};

export abstract class IPluginStatsRepository {
  abstract incrementDownload(author: string, name: string): Promise<void>;
}
