import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Public } from 'src/common/utils/metadata';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // @Public()
  // @Get('/driver')
  // findAll() {
  //   return this.accountService.getAllDriverAccount();
  // }

  @Get()
  async getProfile(@Req() req: Request) {
    const accountID = req['account']?.sub;
    if (!accountID) throw new NotFoundException('Token không hợp lệ');

    const result =
      await this.accountService.findAccountWithDetailsById(accountID);
    if (!result) throw new NotFoundException('Không tìm thấy tài khoản');

    return {
      account: result,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
