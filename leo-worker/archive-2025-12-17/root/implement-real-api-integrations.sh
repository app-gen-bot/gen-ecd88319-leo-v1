#!/bin/bash
#
# AdFlux: Implement Real Google Ads & DV360 API Integrations
#
# This script delegates to app-generator to transform AdFlux from mock adapters
# to production-ready API integrations with real Google Ads and DV360 platforms.
#

set -e  # Exit on error

echo "=============================================="
echo "AdFlux: Real API Integration Implementation"
echo "=============================================="
echo ""
echo "This will:"
echo "  1. Commit current demo validation milestone"
echo "  2. Research Google Ads API v16 & DV360 API integration patterns"
echo "  3. Implement production GoogleAdsApiAdapter & DV360ApiAdapter"
echo "  4. Add secure credential management with Supabase"
echo "  5. Create comprehensive testing & setup documentation"
echo ""
echo "Starting in 3 seconds..."
sleep 3

uv run python run-app-generator.py \
  --resume ~/apps/app-factory/apps/adflux/app \
 --reprompter-mode autonomous \
 --max-iterations 5 \
  --no-expand \
  'AdFlux has successfully achieved production-ready demo status with comprehensive validation complete—all critical bugs fixed, the demo script 100% executable with visual evidence, and the production deployment at https://adflux.fly.dev fully operational with 8 campaigns, 573 performance metrics, and 247 optimization events. The FINAL_DEMO_VALIDATION_REPORT.md confirms 8 out of 10 success criteria passed with only token refresh deployment deferred as a post-demo enhancement. However, the user'\''s strategic guidance reveals a critical limitation that must be addressed before presenting AdFlux as a genuine autonomous media buying platform: the Google Ads and DV360 integrations are currently mock adapters (`USE_MOCK_AD_ADAPTERS=true`) that simulate API responses rather than connecting to real advertising platforms. While this was appropriate for rapid prototyping and demo development, transforming AdFlux into a production-ready product requires implementing actual API integrations that work with real credentials—just API keys, client secrets, and OAuth tokens—without requiring extensive custom development for each deployment.

Commit the uncommitted `.agent_session.json` changes immediately with a message like "Complete final demo validation - CTR and targeting bugs fixed, production ready" to preserve the validation milestone, then pivot strategically to implementing production-grade advertising platform integrations. Delegate to the **research** subagent to perform comprehensive investigation of Google Ads API and DV360 API integration patterns—research the official Google Ads API v16 authentication flows including OAuth2 Web Flow for user consent and service account approaches for backend automation, document the exact credentials required (developer token, client ID, client secret, refresh token, customer ID) and how to obtain them through the Google Ads API Center, investigate the Google Marketing Platform Display & Video 360 API authentication requirements and whether it uses the same OAuth2 flow or requires separate credentials, explore best practices for storing and refreshing OAuth tokens securely in Node.js applications with Supabase as the credential store, research rate limits and quota management strategies to avoid hitting daily API call limits during autonomous optimization cycles, compare existing Node.js libraries (google-ads-api npm package, @google-cloud/dv360 if available, or direct REST API calls using axios) for ease of implementation and maintenance, and document the complete end-to-end integration architecture showing how AdFlux would authenticate once during setup, store credentials encrypted in Supabase, and make authenticated API calls for campaign creation, bid adjustments, performance metric retrieval, and campaign status updates. The research should also investigate whether a single Google Cloud project can provide credentials for both Google Ads API and DV360 API access, or if separate authentication flows are required for each platform.

Once the research subagent completes comprehensive API integration documentation, delegate to the **code** subagent to implement production-ready adapters that replace the mock implementations—create a `GoogleAdsApiAdapter` class that implements the existing `IAdPlatformAdapter` interface using real Google Ads API v16 calls for campaign creation (CreateCampaignOperation), bid management (UpdateCampaign with bidding strategy modifications), performance metrics retrieval (GoogleAdsService.search with GAQL queries for impressions, clicks, conversions, cost), and campaign status control (pause, resume, remove operations), implement a `DV360ApiAdapter` class following the same interface pattern but using DV360 API endpoints for insertion order creation, line item bid adjustments, and performance reporting through DoubleClick Bid Manager API or the newer Display & Video 360 API v2, add a secure credential management system in the existing Supabase schema with a new `platform_api_credentials` table storing encrypted OAuth tokens and refresh logic that automatically renews access tokens before expiration, update the adapter factory pattern in `server/lib/ad-platforms/factory.ts` to instantiate real API adapters when `USE_MOCK_AD_ADAPTERS=false` and validate credentials exist in the database before allowing campaign operations, and create comprehensive environment variable validation that provides clear error messages if required API credentials are missing (GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, DV360_ADVERTISER_ID, etc.) rather than silently falling back to mock mode. After implementation, delegate to the **quality_assurer** subagent to create thorough testing documentation—validate the adapters work correctly with test Google Ads and DV360 accounts using sandbox or low-budget campaigns to avoid production spending during validation, verify OAuth2 token refresh logic prevents authentication failures during long-running autonomous optimization cycles, confirm rate limit handling prevents API quota exhaustion errors, test error scenarios like invalid credentials or revoked OAuth tokens to ensure graceful degradation with clear error messages rather than silent failures, and document the exact credential setup process an AdFlux administrator would follow to connect their Google Ads manager account and DV360 advertiser account, ensuring the integration truly requires "only API keys and such" as the user specified without requiring extensive technical configuration or custom code modifications for each deployment. This systematic research→implementation→validation approach will transform AdFlux from a sophisticated demo with mock data into a genuine production-ready autonomous media buying platform capable of managing real advertising budgets across Google Ads and DV360 with only credential configuration required for deployment.'

echo ""
echo "=============================================="
echo "Script completed!"
echo "=============================================="
