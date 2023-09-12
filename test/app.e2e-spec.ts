import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LawsuitSidesDTO } from 'src/lawsuit/dto/lawsuit.dto';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/lawsuit (POST) TJAL Request valid body', () => {
    let response;
    it('Should return status code 200 consulting a TJAL Lawsuit Code', async () => {
      response = await request(app.getHttpServer()).post('/lawsuit').send({
        lawsuitNumber: '0710802-55.2018.8.02.0001',
      });
      expect(response.status).toEqual(200);
    });

    it('Should property "class" must be equals', () => {
      expect(response.body.classe).toEqual('Procedimento Comum Cível');
    });
    it('Should property "area" must be equals', () => {
      expect(response.body.area).toEqual('Cível');
    });
    it('Should property "assunto" must be equals', () => {
      expect(response.body.assunto).toEqual('Dano Material');
    });
    it('Should property "distribuicao" must be equals', () => {
      expect(response.body.distribuicao).toEqual(
        '02/05/2018 às 19:01 - Sorteio',
      );
    });
    it('Should property "juiz" must be equals', () => {
      expect(response.body.juiz).toBe('Henrique Gomes de Barros Teixeira');
    });
    it('Should property "acao" must be equals', () => {
      expect(response.body.acao).toBe('281178,42');
    });
    it('Should property "partes" must be an Array', () => {
      expect(Array.isArray(response.body.partes)).toBe(true);
    });
    it('Should property "partes" must be an Array of "LawsuitSidesDTO"', () => {
      expect(response.body.partes).toMatchObject<Array<LawsuitSidesDTO>>([
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
      ]);
    });
    it('Should property "movimentacoes" must be an Object', () => {
      expect(
        response.body.movimentacoes &&
          typeof response.body.movimentacoes === 'object',
      ).toBe(true);
    });
    it('Should property "movimentacoes" contains a particular item', () => {
      expect(response.body.movimentacoes.segundaInstancia).toContainEqual({
        data: '26/04/2023',
        descricao: 'Certidão Emitida',
        detalhes:
          'TERMO DE BAIXA Faço baixar estes autos ao Exmo(a). Juiz(a) de Direito da 4ª Vara Cível da Capital, em cumprimento ao despacho de página 872. Maceió, 26 de abril de 2023. Eleonora Paes Cerqueira de França Diretora Adjunta Especial de Assuntos Judiciários Cícera Cristina Lima de Araújo Bandeira Analista Judiciário',
      });
    });
  });

  describe('/lawsuit (POST) TJCE Request valid body', () => {
    let response;
    it('Should return status code 200 consulting a TJCE Lawsuit Code', async () => {
      response = await request(app.getHttpServer()).post('/lawsuit').send({
        lawsuitNumber: '0070337-91.2008.8.06.0001',
      });
      expect(response.status).toEqual(200);
    });

    it('Should property "class" must be equals', () => {
      expect(response.body.classe).toEqual(
        'Ação Penal - Procedimento Ordinário',
      );
    });
    it('Should property "area" must be equals', () => {
      expect(response.body.area).toEqual('Criminal');
    });
    it('Should property "assunto" must be equals', () => {
      expect(response.body.assunto).toEqual('Crimes de Trânsito');
    });
    it('Should property "distribuicao" must be equals', () => {
      expect(response.body.distribuicao).toEqual(
        '02/05/2018 às 09:13 - Sorteio',
      );
    });
    it('Should property "juiz" must be empty', () => {
      expect(response.body.juiz).toBe('');
    });
    it('Should property "acao" must be empty', () => {
      expect(response.body.acao).toBe('');
    });
    it('Should property "partes" must be an Array', () => {
      expect(Array.isArray(response.body.partes)).toBe(true);
    });
    it('Should property "partes" must be an Array of "LawsuitSidesDTO"', () => {
      expect(response.body.partes).toMatchObject<Array<LawsuitSidesDTO>>([
        {
          participacao: 'Vítima',
          nome: 'G. de O. C.',
          advogados: [],
        },
        {
          participacao: 'Vítima',
          nome: 'A. S. F.',
          advogados: [],
        },
        {
          participacao: 'Autor',
          nome: 'Ministério Público do Estado do Ceará',
          advogados: [],
        },
        {
          participacao: 'Terceiro',
          nome: 'Departamento de Tecnologia da Informação e Comunicação - DETIC (Polícia Civil)',
          advogados: [],
        },
        {
          participacao: 'Testemunha',
          nome: 'M. L. S. I.',
          advogados: [],
        },
      ]);
    });
    it('Should property "movimentacoes" must be an Object', () => {
      expect(
        response.body.movimentacoes &&
          typeof response.body.movimentacoes === 'object',
      ).toBe(true);
    });
    it('Should property "movimentacoes" contains a particular item', () => {
      expect(response.body.movimentacoes.primeiraInstancia).toContainEqual({
        data: '16/08/2022',
        descricao: 'Juntada de Ofício',
        detalhes:
          'Nº Protocolo: WEB1.22.02299977-0 Tipo da Petição: Ofício Data: 16/08/2022 12:49',
      });
    });
  });

  describe('/lawsuit (POST) invalid requests', () => {
    it('Should return status code 400 consulting a empty value', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send({
          lawsuitNumbers: '',
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Invalid Justice Segmentation' });
    });

    it('Should return status code 400 consulting a short Lawsuit number', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send({
          lawsuitNumber: '0710802-55.2018.8.02.000',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Falha na tentativa de exibir detalhes do processo.',
        });
    });

    it('Should return status code 400 consulting a big Lawsuit number', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send({
          lawsuitNumber: '0710802-55.2018.8.02.00011',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Falha na tentativa de exibir detalhes do processo.',
        });
    });

    it('Should return status code 400 consulting a wrong Justice Segmentation number', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send({
          lawsuitNumber: '0710802-55.2018.7.02.0001',
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Invalid Justice Segmentation' });
    });

    it('Should return status code 400 consulting a wrong State Segmentation number', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send({
          lawsuitNumber: '0710802-55.2018.8.01.0001',
        })
        .expect(400)
        .expect({ statusCode: 400, message: 'Invalid State Segmentation' });
    });

    it('Should return status code 400 consulting a request without body', async () => {
      return request(app.getHttpServer())
        .post('/lawsuit')
        .send()
        .expect(400)
        .expect({ statusCode: 400, message: 'Invalid Justice Segmentation' });
    });

    it('Should return status code 404 consulting an invalid resource', async () => {
      return request(app.getHttpServer())
        .post('/lawsuits')
        .send({
          lawsuitNumber: '0710802-55.2018.8.02.0001',
        })
        .expect(404)
        .expect({
          message: 'Cannot POST /lawsuits',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
