import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtAccessPayload } from "@congdoan/types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret"
    });
  }

  // Giá trị return được Passport gắn vào request.user — đúng shape JwtAccessPayload.
  validate(payload: JwtAccessPayload): JwtAccessPayload {
    return payload;
  }
}
