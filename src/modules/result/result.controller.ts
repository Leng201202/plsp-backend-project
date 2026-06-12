import { Body, Controller, Post, Res } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultSearchDto } from './dto/result-search.dto';
import { ResultBulkActionDto } from './dto/result-bulk-action.dto';
import { ResultExportDto } from './dto/result-export.dto';
import type { Response } from 'express';

@Controller('results')
export class ResultController {
    constructor(
        private readonly resultService: ResultService,
    ) {}
    
    @Post('search')
    search(@Body() dto: ResultSearchDto){
        return this.resultService.search(dto);
    }

    @Post('delete-many')
    deleteMany(@Body() dto: ResultBulkActionDto){
        return this.resultService.deleteMany(dto);
    }

    @Post('export')
    async exportResult(@Body() dto: ResultExportDto, @Res() res: Response){
        const file=await this.resultService.exportResult(dto);
        res.setHeader(
            'Content-Type',
            file.mimeType,
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${file.fileName}"`,
        );
        res.send(file.file);
    }
}
