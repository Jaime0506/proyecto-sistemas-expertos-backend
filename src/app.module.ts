import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { FailuresModule } from './modules/failures/failures.module';
import { FactsModule } from './modules/facts/facts.module';
import { RulesModule } from './modules/rules/rules.module';
import { RuleFactModule } from './modules/rule-fact/rule-fact.module';
import { FactsFailureModule } from './modules/facts-failure/facts-failure.module';
import { SystemSetupModule } from './modules/system-setup/system-setup.module';
import { InferenceEngineModule } from './modules/inference-engine/inference-engine.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
		TypeOrmModule.forRootAsync(typeOrmConfig),
		AuthModule,
		UsersModule,
		AuthorizationModule,
		FailuresModule,
		FactsModule,
		RulesModule,
		RuleFactModule,
		FactsFailureModule,
		SystemSetupModule,
		InferenceEngineModule,
	],
})
export class AppModule {}
