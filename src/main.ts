import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {

  const logger = new Logger('ProductsMs-main');
  console.log('hola mundo desde products-ms denuevo')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,

    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      }),
  );



  await app.listen();

  logger.log(`Server running on: ${envs.port}`);

}
bootstrap();
