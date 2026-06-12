import { Body, Controller, Post } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultSearchDto } from './dto/result-search.dto';
import { ResultBulkActionDto } from './dto/result-bulk-action.dto';

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
    exportResult(@Body() dto: any){
        return this.resultService.exportResult(dto);
    }
}
