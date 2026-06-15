import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ClassificationRuleService } from './classification-rule.service';
import { CreateClassificationRuleDto } from './dto/create.classification.dto';
import { UpdateClassificationRuleDto } from './dto/update.classification.dto';
import { getCurrentUser } from 'src/common/middleware/curr_user';

@Controller('classification-rule')
export class ClassificationRuleController {
    constructor(
        private readonly classificationRuleService: ClassificationRuleService,
    ) {}

    @Post()
    create(@Body() dto: CreateClassificationRuleDto) {
        return this.classificationRuleService.create(dto, getCurrentUser);
    }

    @Get()
    findAll() {
        return this.classificationRuleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id',ParseUUIDPipe) id: string) {
        return this.classificationRuleService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id',ParseUUIDPipe) id: string, 
        @Body() dto: UpdateClassificationRuleDto
    ) {
        return this.classificationRuleService.update(id, dto, getCurrentUser);// Hardcoded user ID for demonstration, replace with actual user retrieval logic
    }

    @Delete(':id')
    delete(@Param('id',ParseUUIDPipe) id: string) {
        return this.classificationRuleService.delete(id, getCurrentUser);// Hardcoded user ID for demonstration, replace with actual user retrieval logic
    }   
}
