import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable CORS
	app.enableCors({
		origin: ['http://localhost:5173', 'http://localhost:3000'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});

	// Set global prefix for all routes
	app.setGlobalPrefix('api/v1');
	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser.default());

	const config = new DocumentBuilder()
		.setTitle('Sistema Experto')
		.setDescription('Esta es la api de sistemas expertos')
		.setVersion('1.0')
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('api', app, documentFactory);
	await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
