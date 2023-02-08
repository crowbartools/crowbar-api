import { StreamingPlatform } from "../streaming-platform/streaming-platform";

export class User {
  id: string;
  username: string;
  streamingPlatforms: StreamingPlatform[];
}
