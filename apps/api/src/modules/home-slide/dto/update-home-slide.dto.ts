import { PartialType } from "@nestjs/swagger";
import { CreateHomeSlideDto } from "./create-home-slide.dto";

export class UpdateHomeSlideDto extends PartialType(CreateHomeSlideDto) {}
