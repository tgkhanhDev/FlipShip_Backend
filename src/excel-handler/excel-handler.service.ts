import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as process from 'node:process';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';
import { S3Service } from '../thirdParty/s3/s3.service';

@Injectable()
export class ExcelHandlerService {
  private readonly HEADER_RANGE: string;
  private readonly HEADER_VALID_ARRAY: string[];
  private readonly ROW_SKIP: string;

  constructor(
    private readonly s3Service: S3Service
  ) {
    this.HEADER_RANGE = process.env.EXCEL_HEADER_RANGE!;
    this.HEADER_VALID_ARRAY = process.env.EXCEL_HEADER_VALIDATION_ARRAY!.split(',');
    this.ROW_SKIP = process.env.ROW_START_SCAN!;
  }

  readExcelFile(file: Express.Multer.File): any[] {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawHeaders = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: this.HEADER_RANGE,
    })[0] as string[];
    this.validateHeader(rawHeaders);

    //extract arrays
    const data = XLSX.utils.sheet_to_json(sheet, {
      range: parseInt(this.ROW_SKIP),
    }) as Map<string,any>[];
    return this.cleanExcelFile(data);
  }

  async readExcelFromUrl(xlsxUrl: string): Promise<any[]> {
    const response = await axios.get(xlsxUrl, {
      responseType: 'arraybuffer',
    });
    const workbook = XLSX.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawHeaders = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: this.HEADER_RANGE,
    })[0] as string[];
    this.validateHeader(rawHeaders);

    const data = XLSX.utils.sheet_to_json(sheet, {
      range: parseInt(this.ROW_SKIP),
    }) as Map<string,any>[];
    return this.cleanExcelFile(data);
  }

  async validateExcelFile(fileOpt: Express.Multer.File | string): Promise<string> {
    let buffer: Buffer;

    if (typeof fileOpt == 'string') {
      const response = await axios.get(fileOpt, {
        responseType: 'arraybuffer',
      });
      buffer = Buffer.from(response.data); // Ensure it's a Node.js Buffer
    } else if (fileOpt && typeof fileOpt === 'object' && 'buffer' in fileOpt) {
      buffer = fileOpt.buffer;
    } else {
      throw new BadRequestException('File không hợp lệ, vui lòng sử dụng file .xlsx hoặc URL');
    }

    // Now you can proceed to parse buffer using XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawHeaders = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      range: this.HEADER_RANGE,
    })[0] as string[];
    this.validateHeader(rawHeaders);

    return "File hợp lệ";
  }

  async generateExcelAndUploadToS3(data: Record<string, any>[]): Promise<string> {
    const buffer = await this.generateExcelFile(data);
    const key = `${Date.now()}-'MADON'.xlsx`;
    const url = await this.s3Service.uploadFile(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return url;
  }


  protected async generateExcelFile(data: Record<string, any>[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private validateHeader(headers: string[]): void {
    let columnIndex = 66 //B
    let rowIndex = parseInt(this.ROW_SKIP)+1;

    let errorDetails: string[] = [];

    for (let i = 0; i < this.HEADER_VALID_ARRAY.length; i++) {
      let currentColumn = String.fromCharCode(columnIndex + i);
      if (headers[i] !== this.HEADER_VALID_ARRAY[i]) {
        errorDetails.push(`vị trí ${currentColumn}${rowIndex}: [${headers[i]}] -> [${this.HEADER_VALID_ARRAY[i]}]`);
      }
    }

    if (errorDetails.length > 0) {
      throw new BadRequestException('Format của Excel không hợp lệ tại: ' + errorDetails.join(' | '));
    }
  }

  private cleanExcelFile(data: Record<string, any>[]): Record<string, any>[] {
    const recordSize = this.HEADER_VALID_ARRAY.length;
    const formatData: Record<string, any>[] = [];

    data.forEach(item => {
      const formattedItem: Record<string, any> = {};
      let isSkip = false;
      let count = 0;

      for (const key of Object.keys(item)) {
        if (count >= recordSize) break;

        const value = item[key];
        const valueStr = typeof value === 'string' ? value.trim() : `${value}`.trim();

        if (valueStr === '') {
          isSkip = true;
          break;
        }

        formattedItem[key] = value;
        count++;
      }

      if (!isSkip) {
        formatData.push(formattedItem);
      }
    });

    return formatData;
  }
}
