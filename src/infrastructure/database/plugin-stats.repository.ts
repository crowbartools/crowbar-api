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

  async incrementDownload(
    author: string,
    name: string,
    version: string,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO plugin_downloads (author, name, version, count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (author, name, version)
       DO UPDATE SET count = plugin_downloads.count + 1`,
      [author, name, version],
    );
  }

  async getAllTotals(): Promise<PluginStatTotals[]> {
    const result = await this.db.query<{
      author: string;
      name: string;
      total: string;
    }>(
      `SELECT author, name, SUM(count) AS total
       FROM plugin_downloads
       GROUP BY author, name`,
    );

    // pg returns bigint columns as strings
    return result.rows.map((row) => ({
      author: row.author,
      name: row.name,
      downloads: Number(row.total),
    }));
  }
}
