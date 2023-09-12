import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { cleanLawsuitNumber } from '../utils/cleanLawsuitNumber';
import { LawsuitRequestDTO, LawsuitResponseDTO } from './dto/lawsuit.dto';
import { LawsuitService } from './lawsuit.service';

@Controller('/lawsuit')
@ApiTags('Processos')
export class LawsuitController {
  private readonly logger = new Logger(LawsuitController.name);
  constructor(private readonly lawsuitService: LawsuitService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: `Consulta de processos de primeira e segunda instância do TJAL e TJCE.`,
  })
  @ApiOkResponse({ type: LawsuitResponseDTO })
  async lawsuit(@Body() lawsuit: LawsuitRequestDTO, @Res() response: Response) {
    const lawsuitNumber = cleanLawsuitNumber(lawsuit.lawsuitNumber);
    this.logger.debug(`Lawsuit number: ${lawsuitNumber}`);

    const lawsuitData = await this.lawsuitService.lawsuit(lawsuitNumber);
    response.status(HttpStatus.OK).send(lawsuitData);
  }
}
