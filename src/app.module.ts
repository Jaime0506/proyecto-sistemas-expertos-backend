import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { FailuresModule } from './modules/failures/failures.module';
import { FactsModule } from './modules/facts/facts.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { OptionsModule } from './modules/options/options.module';
import { OptionFactModule } from './modules/option-fact/option-fact.module';
import { RulesModule } from './modules/rules/rules.module';
import { RuleFactModule } from './modules/rule-fact/rule-fact.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
		TypeOrmModule.forRootAsync(typeOrmConfig),
		AuthModule,
		UsersModule,
		AuthorizationModule,
		FailuresModule,
		FactsModule,
		QuestionsModule,
		OptionsModule,
		OptionFactModule,
		RulesModule,
		RuleFactModule,
	],
})
export class AppModule {}
