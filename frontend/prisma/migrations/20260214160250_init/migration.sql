-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PrimaryGoal" AS ENUM ('LEARN_BASICS', 'VALUE', 'GROWTH', 'DIVIDEND', 'TRADING_EDU');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "WatchlistCreatedFrom" AS ENUM ('USER', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "TradeSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "EventTypeCode" AS ENUM ('EARNINGS', 'DIVIDEND', 'SPLIT', 'FILING_10Q', 'FILING_10K', 'OTHER');

-- CreateTable
CREATE TABLE "data_providers" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industries" (
    "id" BIGSERIAL NOT NULL,
    "sector_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" BIGSERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exchange" TEXT,
    "sector_id" BIGINT,
    "industry_id" BIGINT,
    "description" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "cik" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_provider_map" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "provider_id" BIGINT NOT NULL,
    "provider_ticker" TEXT,
    "provider_symbol" TEXT,
    "figi" TEXT,
    "isin" TEXT,
    "cusip" TEXT,
    "cik" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_provider_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices_daily" (
    "company_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "open" DECIMAL(18,6),
    "high" DECIMAL(18,6),
    "low" DECIMAL(18,6),
    "close" DECIMAL(18,6) NOT NULL,
    "adj_close" DECIMAL(18,6),
    "volume" BIGINT,
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_daily_pkey" PRIMARY KEY ("company_id","date")
);

-- CreateTable
CREATE TABLE "financials_quarterly" (
    "company_id" BIGINT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "fiscal_quarter" INTEGER NOT NULL,
    "period_end" DATE,
    "revenue" DECIMAL(24,2),
    "gross_profit" DECIMAL(24,2),
    "operating_income" DECIMAL(24,2),
    "net_income" DECIMAL(24,2),
    "eps_basic" DECIMAL(18,6),
    "eps_diluted" DECIMAL(18,6),
    "total_assets" DECIMAL(24,2),
    "total_liabilities" DECIMAL(24,2),
    "total_equity" DECIMAL(24,2),
    "total_debt" DECIMAL(24,2),
    "cash_and_equivalents" DECIMAL(24,2),
    "cash_from_ops" DECIMAL(24,2),
    "cash_from_investing" DECIMAL(24,2),
    "cash_from_financing" DECIMAL(24,2),
    "free_cash_flow" DECIMAL(24,2),
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financials_quarterly_pkey" PRIMARY KEY ("company_id","fiscal_year","fiscal_quarter")
);

-- CreateTable
CREATE TABLE "metric_definitions" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_metrics_daily" (
    "company_id" BIGINT NOT NULL,
    "metric_id" BIGINT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "value" DECIMAL(24,6) NOT NULL,
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_metrics_daily_pkey" PRIMARY KEY ("company_id","metric_id","as_of_date")
);

-- CreateTable
CREATE TABLE "company_metrics_quarterly" (
    "company_id" BIGINT NOT NULL,
    "metric_id" BIGINT NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "fiscal_quarter" INTEGER NOT NULL,
    "value" DECIMAL(24,6) NOT NULL,
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_metrics_quarterly_pkey" PRIMARY KEY ("company_id","metric_id","fiscal_year","fiscal_quarter")
);

-- CreateTable
CREATE TABLE "company_scores" (
    "company_id" BIGINT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "overall" DECIMAL(3,2) NOT NULL,
    "value_score" DECIMAL(3,2),
    "growth_score" DECIMAL(3,2),
    "strength_score" DECIMAL(3,2),
    "dividend_score" DECIMAL(3,2),
    "risk_score" DECIMAL(3,2),
    "beginner_summary" TEXT,
    "good_for" JSONB,
    "caution_for" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_scores_pkey" PRIMARY KEY ("company_id","as_of_date")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" BIGSERIAL NOT NULL,
    "code" "EventTypeCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_events" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "event_type_id" BIGINT NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "date" DATE,
    "title" TEXT,
    "details" JSONB,
    "fiscal_year" INTEGER,
    "fiscal_quarter" INTEGER,
    "eps_est" DECIMAL(18,6),
    "eps_actual" DECIMAL(18,6),
    "revenue_est" DECIMAL(24,2),
    "revenue_actual" DECIMAL(24,2),
    "sec_form_type" TEXT,
    "sec_filing_url" TEXT,
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_items" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source_name" TEXT,
    "published_at" TIMESTAMP(3),
    "summary" TEXT,
    "image_url" TEXT,
    "provider_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_news" (
    "company_id" BIGINT NOT NULL,
    "news_id" BIGINT NOT NULL,
    "relevance_score" DECIMAL(6,3),

    CONSTRAINT "company_news_pkey" PRIMARY KEY ("company_id","news_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "experience_level" "ExperienceLevel" NOT NULL,
    "primary_goal" "PrimaryGoal" NOT NULL,
    "risk_level" "RiskLevel",
    "simulator_starting_cash" DECIMAL(24,2),
    "onboarding_step" INTEGER NOT NULL DEFAULT 1,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_sector_preferences" (
    "user_id" TEXT NOT NULL,
    "sector_id" BIGINT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sector_preferences_pkey" PRIMARY KEY ("user_id","sector_id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Watchlist',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "created_from" "WatchlistCreatedFrom" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_items" (
    "watchlist_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("watchlist_id","company_id")
);

-- CreateTable
CREATE TABLE "paper_portfolios" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Paper Portfolio',
    "base_currency" TEXT NOT NULL DEFAULT 'USD',
    "starting_cash" DECIMAL(24,2) NOT NULL DEFAULT 100000,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "is_default" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paper_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_trades" (
    "id" BIGSERIAL NOT NULL,
    "portfolio_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "side" "TradeSide" NOT NULL,
    "trade_date" DATE NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "fees" DECIMAL(24,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paper_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_value_daily" (
    "portfolio_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "cash_value" DECIMAL(24,2) NOT NULL,
    "positions_value" DECIMAL(24,2) NOT NULL,
    "total_value" DECIMAL(24,2) NOT NULL,
    "daily_return_pct" DECIMAL(10,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_value_daily_pkey" PRIMARY KEY ("portfolio_id","date")
);

-- CreateTable
CREATE TABLE "portfolio_positions_daily" (
    "portfolio_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "avg_cost" DECIMAL(18,6),
    "market_price" DECIMAL(18,6),
    "market_value" DECIMAL(24,2),
    "unrealized_pnl" DECIMAL(24,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_positions_daily_pkey" PRIMARY KEY ("portfolio_id","company_id","date")
);

-- CreateTable
CREATE TABLE "glossary_terms" (
    "id" BIGSERIAL NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_md" TEXT NOT NULL,
    "level" TEXT,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "estimated_minutes" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "user_id" TEXT NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("user_id","lesson_id")
);

-- CreateTable
CREATE TABLE "ingestion_runs" (
    "id" BIGSERIAL NOT NULL,
    "provider_id" BIGINT NOT NULL,
    "job_name" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "status" "IngestionStatus" NOT NULL,
    "rows_upserted" INTEGER,
    "notes" TEXT,

    CONSTRAINT "ingestion_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_errors" (
    "id" BIGSERIAL NOT NULL,
    "run_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingestion_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_providers_code_key" ON "data_providers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_code_key" ON "sectors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "industries_code_key" ON "industries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_ticker_key" ON "companies"("ticker");

-- CreateIndex
CREATE INDEX "companies_sector_id_idx" ON "companies"("sector_id");

-- CreateIndex
CREATE INDEX "companies_industry_id_idx" ON "companies"("industry_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_provider_map_company_id_provider_id_key" ON "company_provider_map"("company_id", "provider_id");

-- CreateIndex
CREATE INDEX "prices_daily_date_idx" ON "prices_daily"("date");

-- CreateIndex
CREATE INDEX "financials_quarterly_period_end_idx" ON "financials_quarterly"("period_end");

-- CreateIndex
CREATE UNIQUE INDEX "metric_definitions_code_key" ON "metric_definitions"("code");

-- CreateIndex
CREATE INDEX "company_metrics_daily_company_id_as_of_date_idx" ON "company_metrics_daily"("company_id", "as_of_date");

-- CreateIndex
CREATE INDEX "company_scores_as_of_date_idx" ON "company_scores"("as_of_date");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_code_key" ON "event_types"("code");

-- CreateIndex
CREATE INDEX "company_events_company_id_date_idx" ON "company_events"("company_id", "date");

-- CreateIndex
CREATE INDEX "company_events_event_type_id_date_idx" ON "company_events"("event_type_id", "date");

-- CreateIndex
CREATE INDEX "company_events_starts_at_idx" ON "company_events"("starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "news_items_url_key" ON "news_items"("url");

-- CreateIndex
CREATE INDEX "news_items_published_at_idx" ON "news_items"("published_at");

-- CreateIndex
CREATE INDEX "company_news_news_id_idx" ON "company_news"("news_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "watchlists_user_id_idx" ON "watchlists"("user_id");

-- CreateIndex
CREATE INDEX "watchlist_items_company_id_idx" ON "watchlist_items"("company_id");

-- CreateIndex
CREATE INDEX "paper_portfolios_user_id_idx" ON "paper_portfolios"("user_id");

-- CreateIndex
CREATE INDEX "paper_trades_portfolio_id_trade_date_idx" ON "paper_trades"("portfolio_id", "trade_date");

-- CreateIndex
CREATE INDEX "paper_trades_company_id_idx" ON "paper_trades"("company_id");

-- CreateIndex
CREATE INDEX "portfolio_positions_daily_portfolio_id_date_idx" ON "portfolio_positions_daily"("portfolio_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "glossary_terms_term_key" ON "glossary_terms"("term");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_is_published_category_sort_order_idx" ON "lessons"("is_published", "category", "sort_order");

-- CreateIndex
CREATE INDEX "ingestion_runs_provider_id_job_name_idx" ON "ingestion_runs"("provider_id", "job_name");

-- CreateIndex
CREATE INDEX "ingestion_errors_run_id_idx" ON "ingestion_errors"("run_id");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_provider_map" ADD CONSTRAINT "company_provider_map_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_provider_map" ADD CONSTRAINT "company_provider_map_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices_daily" ADD CONSTRAINT "prices_daily_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices_daily" ADD CONSTRAINT "prices_daily_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financials_quarterly" ADD CONSTRAINT "financials_quarterly_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financials_quarterly" ADD CONSTRAINT "financials_quarterly_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_daily" ADD CONSTRAINT "company_metrics_daily_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_daily" ADD CONSTRAINT "company_metrics_daily_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_daily" ADD CONSTRAINT "company_metrics_daily_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_quarterly" ADD CONSTRAINT "company_metrics_quarterly_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_quarterly" ADD CONSTRAINT "company_metrics_quarterly_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metrics_quarterly" ADD CONSTRAINT "company_metrics_quarterly_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_scores" ADD CONSTRAINT "company_scores_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_events" ADD CONSTRAINT "company_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_events" ADD CONSTRAINT "company_events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_events" ADD CONSTRAINT "company_events_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_news" ADD CONSTRAINT "company_news_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_news" ADD CONSTRAINT "company_news_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sector_preferences" ADD CONSTRAINT "user_sector_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sector_preferences" ADD CONSTRAINT "user_sector_preferences_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlist_id_fkey" FOREIGN KEY ("watchlist_id") REFERENCES "watchlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_portfolios" ADD CONSTRAINT "paper_portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "paper_portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_trades" ADD CONSTRAINT "paper_trades_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_value_daily" ADD CONSTRAINT "portfolio_value_daily_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "paper_portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_positions_daily" ADD CONSTRAINT "portfolio_positions_daily_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "paper_portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_positions_daily" ADD CONSTRAINT "portfolio_positions_daily_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "data_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_errors" ADD CONSTRAINT "ingestion_errors_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ingestion_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_errors" ADD CONSTRAINT "ingestion_errors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
