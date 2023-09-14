import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { urlManagement } from '../utils/urlManagement';
import { gatewayRequest } from './client/gateway';
import {
  LawsuitMovesDTO,
  LawsuitResponseDTO,
  LawsuitSidesDTO,
} from './dto/lawsuit.dto';

const regex = /[\n\t]/g;
const spaceRegex = /[\u202F\u00A0]/g;

@Injectable()
export class LawsuitService {
  private readonly logger: Logger = new Logger(LawsuitService.name);

  async lawsuit(lawsuitNumber: string): Promise<LawsuitResponseDTO> {
    try {
      this.logger.debug(`Starting requests`);
      const urls = urlManagement(lawsuitNumber);
      const [firstInstanceRawHTML, secondInstanceRawHTMLCodes] =
        await Promise.all([
          gatewayRequest(
            `${urls.showFirstInstanceUrl}?processo.foro=1&processo.numero=${lawsuitNumber}`,
          ),
          gatewayRequest(
            `${urls.searchUrl}?cbPesquisa=NUMPROC&dePesquisaNuUnificado=${lawsuitNumber}&dePesquisaNuUnificado=UNIFICADO&tipoNuProcesso=UNIFICADO`,
          ),
        ]);

      const secondInstanceLawsuitCodes = await this.extractLawsuitCodes(
        secondInstanceRawHTMLCodes,
      );

      const secondInstanceRawHtmlStorage =
        await this.extractSecondInstanceRawHTML(
          secondInstanceLawsuitCodes,
          `${urls.showSecondInstanceUrl}`,
        );

      const [primeiraInstancia, segundaInstancia] = await Promise.all([
        this.extractFirstInstanceData(firstInstanceRawHTML),
        this.extractSecondInstanceData(secondInstanceRawHtmlStorage),
      ]);

      return {
        ...primeiraInstancia,
        movimentacoes: {
          primeiraInstancia: primeiraInstancia.movimentacoes.primeiraInstancia,
          segundaInstancia,
        },
      };
    } catch (error) {
      throw new HttpException(error['message'], error['status']);
    }
  }

  private async extractFirstInstanceData(
    rawHTML: string,
  ): Promise<LawsuitResponseDTO> {
    try {
      const $ = cheerio.load(rawHTML);

      const errorMessageRawHTML = $('td#mensagemRetorno').text().trim();
      if (errorMessageRawHTML) {
        throw new HttpException(errorMessageRawHTML, HttpStatus.BAD_REQUEST);
      }

      const classe = $('span#classeProcesso').text().trim();
      const area = $('div#areaProcesso').text().trim();
      const assunto = $('span#assuntoProcesso').text().trim();
      const distribuicao = $('div#dataHoraDistribuicaoProcesso').text().trim();
      const juiz = $('span#juizProcesso').text().trim();
      const acao = $('div#valorAcaoProcesso')
        .text()
        .replace('R$', '')
        .replaceAll('.', '')
        .trim();
      const [partes, primeiraInstancia] = await Promise.all([
        this.extractPartes($),
        this.extractMovimentacoes($, 1),
      ]);

      return {
        classe,
        area,
        assunto,
        distribuicao,
        juiz,
        acao,
        partes,
        movimentacoes: {
          primeiraInstancia,
          segundaInstancia: [],
        },
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  private async extractSecondInstanceRawHTML(
    lawsuitCodes: Array<string>,
    url: string,
  ) {
    try {
      const rawHtmlStorage = lawsuitCodes.map(
        async (code) => await gatewayRequest(`${url}?processo.codigo=${code}`),
      );
      return Promise.all(rawHtmlStorage);
    } catch (error) {
      throw new HttpException(error['message'], error['status']);
    }
  }

  private async extractSecondInstanceData(
    rawHtmlArray: Array<string>,
  ): Promise<Array<LawsuitMovesDTO>> {
    try {
      const promises: Array<Promise<Array<LawsuitMovesDTO>>> = rawHtmlArray.map(
        async (item) => {
          const $ = cheerio.load(item);
          const errorMessageRawHTML = $('td#mensagemRetorno').text().trim();
          if (errorMessageRawHTML) {
            throw new HttpException(
              errorMessageRawHTML,
              HttpStatus.BAD_REQUEST,
            );
          }
          return this.extractMovimentacoes($, 2);
        },
      );
      const resultArrays = await Promise.all(promises);
      return resultArrays.reduce((acc, current) => [...acc, ...current], []);
    } catch (error) {
      throw new HttpException(error['message'], error['status']);
    }
  }

  private async extractLawsuitCodes(rawHTML: string): Promise<Array<string>> {
    const $ = cheerio.load(rawHTML);
    const lawsuitSecondInstanceCodes: Array<string> = [];

    $('input#processoSelecionado').each(function () {
      lawsuitSecondInstanceCodes.push($(this).attr('value'));
    });

    return lawsuitSecondInstanceCodes;
  }

  private async extractPartes(
    $: cheerio.CheerioAPI,
  ): Promise<Array<LawsuitSidesDTO>> {
    const partes: Array<LawsuitSidesDTO> = [];
    const lawyerRegex = /\b(Advogad[oa]):?\s?\b/gi;

    $('table#tableTodasPartes')
      .children()
      .contents()
      .each(function () {
        const participacao = $(this)
          .contents()
          .children('.tipoDeParticipacao')
          .text()
          .replaceAll(regex, '')
          .replaceAll(spaceRegex, ' ')
          .trim();
        const nomeParteEAdvogado = $(this)
          .children('.nomeParteEAdvogado')
          .contents()
          .text()
          .replaceAll(regex, '')
          .replaceAll(spaceRegex, ' ')
          .trim();

        const searchElements: IterableIterator<RegExpMatchArray> =
          nomeParteEAdvogado.matchAll(lawyerRegex);

        const matches: Array<RegExpMatchArray> = [...searchElements];

        matches.sort((a, b) => a.index - b.index);

        const nome = nomeParteEAdvogado
          .slice(0, matches[0]?.input.indexOf(matches[0][0]))
          .trim();

        let advogados: Array<string> = [];
        for (const element of matches) {
          const splitter = element.input
            .split(lawyerRegex)
            .filter((e) => !e.includes('Advogad'));

          advogados = splitter.filter((e) => !e.includes(nome));
        }

        if (participacao && nome) {
          partes.push({ participacao, nome, advogados });
        }
      });

    return partes;
  }

  private async extractMovimentacoes(
    $: cheerio.CheerioAPI,
    instance: number,
  ): Promise<Array<LawsuitMovesDTO>> {
    const movimentacoes: Array<LawsuitMovesDTO> = [];

    const selectors = {
      dataSelector:
        {
          1: 'td.dataMovimentacao',
          2: 'td.dataMovimentacaoProcesso',
        }[instance] || '',
      detalhesAndDescricaoSelector:
        {
          1: 'td.descricaoMovimentacao',
          2: 'td.descricaoMovimentacaoProcesso',
        }[instance] || '',
    };

    $('tbody#tabelaTodasMovimentacoes')
      .children()
      .each(function () {
        const data = $(this)
          .children(`${selectors.dataSelector}`)
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(spaceRegex, ' ')
          .trim();

        const detalhes = $(this)
          .children(`${selectors.detalhesAndDescricaoSelector}`)
          .contents()
          .closest('span')
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(spaceRegex, ' ')
          .trim();

        const descricao = $(this)
          .children(`${selectors.detalhesAndDescricaoSelector}`)
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(spaceRegex, ' ')
          .replace(detalhes, '')
          .trim();

        const response = detalhes
          ? { data, descricao, detalhes }
          : { data, descricao };

        movimentacoes.push(response);
      });
    return movimentacoes;
  }
}
