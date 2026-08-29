import { PartialType } from "@nestjs/swagger";
import { CreateLegalExamQuestionDto } from "./create-question.dto";

export class UpdateLegalExamQuestionDto extends PartialType(CreateLegalExamQuestionDto) {}
