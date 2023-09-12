import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LawsuitSidesDTO {
  @ApiProperty({
    format: 'string',
    example: 'Autor',
  })
  participacao: string;
  @ApiProperty({
    format: 'string',
    example: 'José Carlos Cerqueira Souza Filho',
  })
  nome: string;
  @ApiProperty({
    format: 'Array',
    example: '[Vinicius Faria de Cerqueira]',
  })
  advogados: Array<string>;
}

export class LawsuitMovesDTO {
  @ApiProperty({
    format: 'string',
    example: '24/08/2023',
  })
  data: string;
  @ApiProperty({
    format: 'string',
    example: 'Arquivado Definitivamente',
  })
  descricao: string;
  @ApiProperty({
    format: 'string',
    example: '...',
  })
  detalhes?: string;
}

export class LawsuitRequestDTO {
  @IsNotEmpty()
  @Length(25, 25)
  @IsString()
  @ApiProperty({
    format: 'string',
    example: '0710802-55.2018.8.02.0001',
  })
  lawsuitNumber: string;
}

export class LawsuitResponseDTO {
  @ApiProperty({
    format: 'string',
    example: 'Procedimento Comum Cível',
  })
  classe: string;
  @ApiProperty({
    format: 'string',
    example: 'Cível',
  })
  area: string;
  @ApiProperty({
    format: 'string',
    example: 'Dano Material',
  })
  assunto: string;
  @ApiProperty({
    format: 'string',
    example: '02/05/2018 às 19:01 - Sorteio',
  })
  distribuicao: string;
  @ApiProperty({
    format: 'string',
    example: 'Henrique Gomes de Barros Teixeira',
  })
  juiz: string;
  @ApiProperty({
    format: 'string',
    example: '281178,42',
  })
  acao: string;
  @ApiProperty({
    format: 'Array',
    type: [LawsuitSidesDTO],
    example: [
      {
        participacao: 'Autor',
        nome: 'José Carlos Cerqueira Souza Filho',
        advogados: ['Vinicius Faria de Cerqueira'],
      },
      {
        participacao: 'Autora',
        nome: 'Livia Nascimento da Rocha',
        advogados: ['Vinicius Faria de Cerqueira'],
      },
      {
        participacao: 'Ré',
        nome: 'Cony Engenharia Ltda.',
        advogados: [
          'Carlos Henrique de Mendonça Brandão ',
          'Guilherme Freire Furtado ',
          'Maria Eugênia Barreiros de Mello ',
          'Vítor Reis de Araujo Carvalho',
        ],
      },
      {
        participacao: 'Réu',
        nome: 'Banco do Brasil S A',
        advogados: ['Louise Rainer Pereira Gionédis'],
      },
    ],
  })
  partes: Array<LawsuitSidesDTO>;
  @ApiProperty({
    format: 'object',
    example: {
      primeiraInstancia: [
        {
          data: '24/08/2023',
          descricao: 'Arquivado Definitivamente',
        },
        {
          data: '24/08/2023',
          descricao: 'Certidão de Arquivamento Sem Custas a recolher',
          detalhes: 'Certidão de Arquivamento Sem Custas a Recolher',
        },
      ],
      segundaInstancia: [
        {
          data: '26/04/2023',
          descricao: 'Certidão de Envio ao 1º Grau',
          detalhes: 'Faço remessa dos presentes autos à Origem.',
        },
        {
          data: '26/04/2023',
          descricao: 'Baixa Definitiva',
        },
        {
          data: '26/04/2023',
          descricao: 'Certidão Emitida',
          detalhes:
            'TERMO DE BAIXA Faço baixar estes autos ao Exmo(a). Juiz(a) de Direito da 4ª Vara Cível da Capital, em cumprimento ao despacho de página 872. Maceió, 26 de abril de 2023. Eleonora Paes Cerqueira de França Diretora Adjunta Especial de Assuntos Judiciários Cícera Cristina Lima de Araújo Bandeira Analista Judiciário',
        },
      ],
    },
  })
  movimentacoes: {
    primeiraInstancia: Array<LawsuitMovesDTO>;
    segundaInstancia: Array<LawsuitMovesDTO>;
  };
}
