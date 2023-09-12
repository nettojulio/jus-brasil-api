import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { UrlDict, urlManagement } from '../utils/urlManagement';
import { gatewayRequest } from './client/gateway';
import {
  LawsuitMovesDTO,
  LawsuitResponseDTO,
  LawsuitSidesDTO,
} from './dto/lawsuit.dto';

@Injectable()
export class LawsuitService {
  private readonly logger: Logger = new Logger(LawsuitService.name);

  async lawsuit(lawsuitNumber: string): Promise<LawsuitResponseDTO> {
    this.logger.debug(`Starting requests`);
    const urls = urlManagement(lawsuitNumber);
    return this.lawsuitSerch(lawsuitNumber, urls);
  }

  private async lawsuitSerch(
    lawsuitNumber: string,
    urls: UrlDict,
  ): Promise<LawsuitResponseDTO> {
    const regex = /[\n\t]/g;
    const spaceRegex = new RegExp(/[\u202F\u00A0]/g);
    const firstInstanceRawHTML = await gatewayRequest(
      `${urls.showFirstInstanceUrl}?processo.foro=1&processo.numero=${lawsuitNumber}`,
    );
    const secondInstanceRawHTMLCodes = await gatewayRequest(
      `${urls.searchUrl}?cbPesquisa=NUMPROC&dePesquisaNuUnificado=${lawsuitNumber}&dePesquisaNuUnificado=UNIFICADO&tipoNuProcesso=UNIFICADO`,
    );
    const $ = cheerio.load(firstInstanceRawHTML);

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
      .replace('.', '')
      .trim();
    const partes: Array<LawsuitSidesDTO> = [];
    const primeiraInstancia: Array<LawsuitMovesDTO> = [];

    $('table#tableTodasPartes')
      .children()
      .contents()
      .each(function () {
        const lawyerRegex = new RegExp(/\b(Advogad[oa]):?\s?\b/gi);

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

    $('tbody#tabelaTodasMovimentacoes')
      .children()
      .each(function () {
        const data = $(this)
          .children('td.dataMovimentacao')
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(new RegExp(/[\u202F\u00A0]/g), ' ')
          .trim();

        const detalhes = $(this)
          .children('td.descricaoMovimentacao')
          .contents()
          .closest('span')
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(new RegExp(/[\u202F\u00A0]/g), ' ')
          .trim();

        const descricao = $(this)
          .children('td.descricaoMovimentacao')
          .text()
          .replaceAll(regex, ' ')
          .replaceAll(new RegExp(/[\u202F\u00A0]/g), ' ')
          .replace(detalhes, '')
          .trim();

        const movimentacao: LawsuitMovesDTO = detalhes
          ? { data, descricao, detalhes }
          : { data, descricao };

        primeiraInstancia.push(movimentacao);
      });

    const secondInstanceLawsuitCodes = await this.extractLawsuitCodes(
      secondInstanceRawHTMLCodes,
    );

    const segundaInstancia = await this.secondInstanceParse(
      secondInstanceLawsuitCodes,
      `${urls.showSecondInstanceUrl}?processo.codigo`,
    );

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
        segundaInstancia,
      },
    };
  }

  /**
   *
   * @param rawHTML
   * @returns
   */
  private async extractLawsuitCodes(rawHTML: string): Promise<Array<string>> {
    const $ = cheerio.load(rawHTML);
    const lawsuitSecondInstanceCodes: Array<string> = [];

    $('input#processoSelecionado').each(function () {
      lawsuitSecondInstanceCodes.push($(this).attr('value'));
    });

    return lawsuitSecondInstanceCodes;
  }
  /**
   *
   * @param lawsuitCodes
   * @param url
   * @returns
   */
  private async secondInstanceParse(
    lawsuitCodes: Array<string>,
    url: string,
  ): Promise<Array<LawsuitMovesDTO>> {
    const movimentacoes: Array<LawsuitMovesDTO> = [];
    const trimRegex = /[\n\t]/g;
    const spaceRegex = new RegExp(/[\u202F\u00A0]/g);

    for (const item of lawsuitCodes) {
      const rawHTML = await gatewayRequest(`${url}=${item}`);
      const $ = cheerio.load(rawHTML);

      $('tbody#tabelaTodasMovimentacoes')
        .children()
        .each(function () {
          const data = $(this)
            .children('td.dataMovimentacaoProcesso')
            .text()
            .replaceAll(trimRegex, ' ')
            .replaceAll(spaceRegex, ' ')
            .trim();

          const detalhes = $(this)
            .children('td.descricaoMovimentacaoProcesso')
            .contents()
            .closest('span')
            .text()
            .replaceAll(trimRegex, ' ')
            .replaceAll(spaceRegex, ' ')
            .trim();

          const descricao = $(this)
            .children('td.descricaoMovimentacaoProcesso')
            .text()
            .replaceAll(trimRegex, ' ')
            .replaceAll(spaceRegex, ' ')
            .replace(detalhes, '')
            .trim();

          const response = detalhes
            ? { data, descricao, detalhes }
            : { data, descricao };

          movimentacoes.push(response);
        });
    }

    return movimentacoes;
  }
}
