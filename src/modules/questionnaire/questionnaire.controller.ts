import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { CreateQuestionnaireDto } from './dto/create.questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update.questionnaire.dto';
import { getCurrentUser } from 'src/common/middleware/curr_user';
import { QuestionnaireBulkActionDto } from './dto/questionnaire-bulk-action.dto';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  create(@Body() dto: CreateQuestionnaireDto) {
    return this.questionnaireService.create(dto, getCurrentUser);
  }

  @Get()
  findAll() {
    return this.questionnaireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionnaireDto) {
    return this.questionnaireService.update(id, dto, getCurrentUser);
  }

  @Post('delete-many')
  deleteMany(@Body() dto: QuestionnaireBulkActionDto) {
    return this.questionnaireService.deleteMany(dto, getCurrentUser);
  }
}
