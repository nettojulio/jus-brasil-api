import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { divideLawsuitNumber } from './divideLawsuitNumber';
import { SegmentNumbers } from './segmentsNumbers.enum';

export type UrlDict = {
  showFirstInstanceUrl: string;
  showSecondInstanceUrl: string;
  searchUrl: string;
};

export function urlManagement(lawsuitNumber: string): UrlDict {
  const logger = new Logger();
  const [, justiceSegment, stateSegment] = divideLawsuitNumber(lawsuitNumber);

  if (justiceSegment !== SegmentNumbers.JUSTICE) {
    const message = 'Invalid Justice Segmentation';
    logger.error(message);
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  switch (stateSegment) {
    case SegmentNumbers.AL:
      logger.debug(`TJAL Request`);
      return {
        showFirstInstanceUrl: `${process.env.BASE_URL_TJAL_FIRST_SEARCH}`,
        showSecondInstanceUrl: `${process.env.BASE_URL_TJAL_SECOND_SEARCH}`,
        searchUrl: `${process.env.BASE_URL_TJAL_SEARCH}`,
      };
    case SegmentNumbers.CE:
      logger.debug(`TJCE Request`);
      return {
        showFirstInstanceUrl: `${process.env.BASE_URL_TJCE_FIRST_SEARCH}`,
        showSecondInstanceUrl: `${process.env.BASE_URL_TJCE_SECOND_SEARCH}`,
        searchUrl: `${process.env.BASE_URL_TJCE_SEARCH}`,
      };
    default:
      throw new HttpException(
        'Invalid State Segmentation',
        HttpStatus.BAD_REQUEST,
      );
  }
}
