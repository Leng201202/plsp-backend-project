import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { SubmissionService } from './service/submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('submission')
export class SubmissionController {
    constructor(
        private readonly submissionService: SubmissionService,
    ) {}

    @Post()
    async create(@Body() dto: CreateSubmissionDto, @Req() req) {
        const userAgent = req.headers['user-agent'] || '';
        return this.submissionService.create(dto, userAgent);
    }

    @Get()
    async findAll() {
        return this.submissionService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.submissionService.findOne(id);
    }

 
    @Get('questionnaire/:questionnaireId')
    async findByQuestionnaire(@Param('questionnaireId', ParseUUIDPipe) questionnaireId: string) {
        return this.submissionService.findByQuestionnaire(questionnaireId);
    }

    @Delete(':id')
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        const deleteBy = 1; // In a real application, you would get the user performing the deletion
        return this.submissionService.delete(id, deleteBy);
    }
}
