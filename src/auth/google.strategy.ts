import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleStrategy {
  private client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      scope: ['email', 'profile'],
      redirect_uri: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  async validate(code: string): Promise<any> {
    const { tokens } = await this.client.getToken(code);
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');
    return {
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
    };
  }
}