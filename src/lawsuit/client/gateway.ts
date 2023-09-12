import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export async function gatewayRequest(url: string): Promise<string> {
  const logger = new Logger();
  const data = JSON.stringify({
    url,
  });

  const config = {
    method: 'POST',
    maxBodyLength: Infinity,
    url: `${process.env.GATEWAY_URL}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };

  return axios
    .request(config)
    .then((response) => {
      logger.debug('api gateway response ok');
      return response.data;
    })
    .catch((error: AxiosError) => {
      const message = `api gateway error: ${error.message}`;
      logger.error(message);
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    });
}
