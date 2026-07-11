import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Pool, QueryResult, QueryResultRow } from "pg";
import appConfig from "../config";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS plugin_downloads (
    author  text NOT NULL,
    name    text NOT NULL,
    version text NOT NULL,
    count   bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (author, name, version)
  );
`;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {
    this.pool = new Pool({ connectionString: this.config.databaseUrl });
  }

  async onModuleInit(): Promise<void> {
    await this.pool.query(SCHEMA);
    this.logger.log("Database schema ready");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
