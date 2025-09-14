export interface TwitchUser {
  twitchUsername: string;
  twitchUserId: string;
}

export interface WebSocketUser extends TwitchUser {
  clientId: string;
}
