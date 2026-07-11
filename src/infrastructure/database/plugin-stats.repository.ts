import { Injectable } from "@nestjs/common";
import {
  IPluginStatsRepository,
  PluginStatTotals,
} from "src/domain/plugins/plugin-stats.repository";
import { DatabaseService } from "./database.service";

@Injectable()
export class PluginStatsRepository extends IPluginStatsRepository {
  constructor(private readonly db: DatabaseService) {
    super();
  }

  async incrementDownload(author: string, name: string): Promise<void> {
    await this.db.query(
      `INSERT INTO plugin_downloads (author, name, count)
       VALUES ($1, $2, 1)
       ON CONFLICT (author, name)
       DO UPDATE SET count = plugin_downloads.count + 1`,
      [author, name],
    );
  }

  async getAllTotals(): Promise<PluginStatTotals[]> {
    const result = await this.db.query<{
      author: string;
      name: string;
      count: string;
    }>("SELECT author, name, count FROM plugin_downloads");

    // pg returns bigint columns as strings
    return result.rows.map((row) => ({
      author: row.author,
      name: row.name,
      downloads: Number(row.count),
    }));
  }
}
