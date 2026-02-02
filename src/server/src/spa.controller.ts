import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class SpaController {
  @Get(['/', '/login', '/dashboard', '/dashboard/*'])
  serveSpa(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}