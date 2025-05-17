import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { Public} from 'src/common/utils/metadata';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // @Public()
  // @Get('/driver')
  // findAll() {
  //   return this.accountService.getAllDriverAccount();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
