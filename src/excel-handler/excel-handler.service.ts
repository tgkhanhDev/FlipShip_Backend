import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as process from 'node:process';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';
import { S3Service } from '../thirdParty/s3/s3.service';
import { join } from 'path';
import { DriverAccountTemplateDto } from './dtos/driverAccount.dto';

@Injectable()
export class ExcelHandlerService {
  private readonly HEADER_RANGE: string;
  private readonly HEADER_VALID_ARRAY: string[];
  private readonly ROW_SKIP: string;

  constructor(private readonly s3Service: S3Service) {
    this.HEADER_RANGE = process.env.EXCEL_HEADER_RANGE!;
    this.HEADER_VALID_ARRAY =
      process.env.EXCEL_HEADER_VALIDATION_ARRAY!.split(',');
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
    }) as Map<string, any>[];
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
    }) as Map<string, any>[];
    return this.cleanExcelFile(data);
  }

  async validateExcelFile(
    fileOpt: Express.Multer.File | string,
  ): Promise<string> {
    let buffer: Buffer;

    if (typeof fileOpt == 'string') {
      const response = await axios.get(fileOpt, {
        responseType: 'arraybuffer',
      });
      buffer = Buffer.from(response.data); // Ensure it's a Node.js Buffer
    } else if (fileOpt && typeof fileOpt === 'object' && 'buffer' in fileOpt) {
      buffer = fileOpt.buffer;
    } else {
      throw new BadRequestException(
        'File không hợp lệ, vui lòng sử dụng file .xlsx hoặc URL',
      );
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

    return 'File hợp lệ';
  }

  async generateExcelAndUploadToS3(
    data: Record<string, any>[] | any[],
    templatePath: string = join('public', 'templates', 'driverAccount.xlsx'), // Path to template
    startCell: string = 'B5', // Starting cell (e.g., 'B5' or 'K5')
  ): Promise<string> {
    try {
      const buffer = await this.generateExcelFile(
        data,
        templatePath,
        startCell,
      );
      const key = `${Date.now()}-MADON.xlsx`;
      const url = await this.s3Service.uploadFile(
        key,
        buffer,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      return url;
    } catch (error) {
      Logger.error(
        `Error generating Excel and uploading to S3: ${error.message}`,
      );
      throw new BadRequestException({
        status: 400,
        message: 'Failed to generate Excel file',
        detail: error.message,
      });
    }
  }

  protected async generateExcelFile(
    data: Record<string, any>[],
    templatePath: string,
    startCell: string,
  ): Promise<Buffer> {
    try {
      // Validate template exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found at: ${templatePath}`);
      }

      // Load template
      const workbook = XLSX.readFile(templatePath, { cellStyles: true });
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert startCell (e.g., 'B5') to row and column
      const { row, col } = this.parseCellAddress(startCell);

      // Add data starting at startCell
      XLSX.utils.sheet_add_json(worksheet, data, {
        origin: startCell, // Start at B5 or K5
        skipHeader: true, // Skip headers as per your setting
      });

      // Apply full borders to data cells
      const borderStyle = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };

      // Determine the number of columns from the first data row (if any)
      const numCols = data.length > 0 ? Object.keys(data[0]).length : 0;
      // Number of rows is the number of data entries
      const numRows = data.length;

      // Apply borders to each cell in the data range
      if (numRows > 0) {
        for (let r = row; r < row + numRows; r++) {
          for (let c = col; c < col + numCols; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c });
            if (!worksheet[cellAddress]) {
              worksheet[cellAddress] = { t: 's', v: '' }; // Initialize empty cell
            }
            worksheet[cellAddress].s = worksheet[cellAddress].s || {};
            worksheet[cellAddress].s.border = borderStyle;
          }
        }
      }

      // Write workbook to buffer
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      Logger.error(`Error generating Excel file: ${error.message}`);
      throw new Error(`Failed to generate Excel file: ${error.message}`);
    }
  }

  private parseCellAddress(cell: string): { row: number; col: number } {
    const match = cell.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell address: ${cell}`);
    }
    const [, colStr, rowStr] = match;
    const col = XLSX.utils.decode_col(colStr); // e.g., 'B' -> 1
    const row = parseInt(rowStr, 10) - 1; // e.g., '5' -> 4 (0-based)
    return { row, col };
  }

  private applyFullBorders(
    worksheet: XLSX.WorkSheet,
    data: Record<string, any>[],
    startRow: number,
    startCol: number,
  ) {
    const borderStyle = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };

    // // Calculate range: headers + data rows
    // const numRows = data.length + 1; // +1 for headers
    // const numCols = data.length > 0 ? Object.keys(data[0]).length : 0;
    //
    // for (let r = startRow; r < startRow + numRows; r++) {
    //   for (let c = startCol; c < startCol + numCols; c++) {
    //     const cellAddress = XLSX.utils.encode_cell({ r, c });
    //     if (!worksheet[cellAddress]) {
    //       worksheet[cellAddress] = { t: 's', v: '' }; // Initialize empty cell
    //     }
    //     worksheet[cellAddress].s = worksheet[cellAddress].s || {};
    //     worksheet[cellAddress].s.border = borderStyle;
    //   }
    // }
  }

  private validateHeader(headers: string[]): void {
    let columnIndex = 66; //B
    let rowIndex = parseInt(this.ROW_SKIP) + 1;

    let errorDetails: string[] = [];

    for (let i = 0; i < this.HEADER_VALID_ARRAY.length; i++) {
      let currentColumn = String.fromCharCode(columnIndex + i);
      if (headers[i] !== this.HEADER_VALID_ARRAY[i]) {
        errorDetails.push(
          `vị trí ${currentColumn}${rowIndex}: [${headers[i]}] -> [${this.HEADER_VALID_ARRAY[i]}]`,
        );
      }
    }

    if (errorDetails.length > 0) {
      throw new BadRequestException(
        'Format của Excel không hợp lệ tại: ' + errorDetails.join(' | '),
      );
    }
  }

  private cleanExcelFile(data: Record<string, any>[]): Record<string, any>[] {
    const recordSize = this.HEADER_VALID_ARRAY.length;
    const formatData: Record<string, any>[] = [];

    data.forEach((item) => {
      const formattedItem: Record<string, any> = {};
      let isSkip = false;
      let count = 0;

      for (const key of Object.keys(item)) {
        if (count >= recordSize) break;

        const value = item[key];
        const valueStr =
          typeof value === 'string' ? value.trim() : `${value}`.trim();

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
