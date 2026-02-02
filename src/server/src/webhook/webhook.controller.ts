import { Controller, Get, Post, Query, Body, HttpStatus, HttpException, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('webhook')
export class WebhookController {
  constructor(private configService: ConfigService) {}

  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = this.configService.get<string>('FB_VERIFY_TOKEN');
    
    console.log('📞 [GET /webhook] Facebook verification request');
    console.log('  Mode:', mode);
    console.log('  Token:', token);
    console.log('  Challenge:', challenge);

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ [GET /webhook] Verification successful');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      console.log('❌ [GET /webhook] Verification failed - token mismatch');
      throw new HttpException('Verification failed', HttpStatus.FORBIDDEN);
    }
  }

  @Post()
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    console.log('📨 [POST /webhook] Received message from Facebook');
    
    try {
      // Forward to AI service
      const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8080';
      
      await axios.post(`${aiServiceUrl}/webhook`, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Respond to Facebook immediately
      return res.status(HttpStatus.OK).json({ status: 'ok' });
    } catch (error) {
      console.error('❌ Error forwarding to AI service:', error.message);
      // Still respond OK to Facebook to avoid retries
      return res.status(HttpStatus.OK).json({ status: 'ok' });
    }
  }
}
