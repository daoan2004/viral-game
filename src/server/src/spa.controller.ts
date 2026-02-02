import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class SpaController {
  @Get(['/', '/login', '/dashboard', '/dashboard/*'])
  serveSpa(@Res() res: Response) {
    const indexPath = join(process.cwd(), 'public', 'index.html');
    // console.log('Serving SPA from:', indexPath); // Debug log
    res.sendFile(indexPath);
  }
}