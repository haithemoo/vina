import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function buildOAuthUrl(req: Request): string {
  const redirectUri = `${ENV.appUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);
  
  // Build authorization URL with required parameters
  const params = new URLSearchParams({
    clientId: ENV.appId,
    responseType: "code",
    redirectUri: redirectUri,
    state: state,
    scope: "openid profile email",
  });
  
  return `${ENV.oAuthServerUrl}/webdev.v1.WebDevAuthPublicService/Authorize?${params.toString()}`;
}

export function registerOAuthRoutes(app: Express) {
  // OAuth start route - redirects to OAuth server for authentication
  app.get("/api/oauth/start", async (req: Request, res: Response) => {
    if (!ENV.oAuthServerUrl) {
      res.status(500).json({ error: "OAuth server not configured" });
      return;
    }
    
    const oauthUrl = buildOAuthUrl(req);
    res.redirect(302, oauthUrl);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
