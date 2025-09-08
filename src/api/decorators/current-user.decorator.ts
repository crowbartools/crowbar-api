import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const contextType = ctx.getType();
  if (contextType === "ws") {
    const client = ctx.switchToWs().getClient();
    const user = client._socket?.user;
    if (!user) throw new Error("User not found in WebSocket client");
    return user;
  }
  const request = ctx.switchToHttp().getRequest();

  if (!request.user) throw new Error("User not found in request");

  return request.user;
});
