import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return { status: 200 };
  }

  @Get('')
  index(@Res() res: Response) {
    return res.redirect('/api');
  }
}
