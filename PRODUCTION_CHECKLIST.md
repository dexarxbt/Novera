# Production Deployment Checklist

Use this checklist to ensure Novera Bot is ready for production deployment and real student testing.

## Pre-Deployment

### Infrastructure Setup
- [ ] Domain registered and DNS configured
- [ ] SSL/TLS certificate installed (HTTPS required for Telegram)
- [ ] Hosting provider account created (Railway, AWS, DigitalOcean, etc.)
- [ ] Firewall rules allow ports 3000 (webhook) and 4000 (health check)
- [ ] Database/storage configured if needed

### Credentials & Secrets
- [ ] Telegram bot token obtained from @BotFather
- [ ] Telegram webhook secret generated (32+ random characters)
- [ ] Gemini API key created and verified
- [ ] Walrus testnet credentials obtained
- [ ] All secrets stored in provider's vault (not committed to repo)
- [ ] Environment variables documented in DEPLOYMENT.md

### Code Quality
- [ ] All tests passing: `pnpm -r run test:run`
- [ ] Type checking passes: `pnpm -r run type-check`
- [ ] No linting errors: `pnpm -r run lint` (if enabled)
- [ ] Build succeeds: `pnpm -r run build`
- [ ] No console errors or warnings
- [ ] Error handling covers all edge cases

### Configuration
- [ ] NODE_ENV set to `production`
- [ ] LOG_LEVEL set to `info` (not debug)
- [ ] PUBLIC_DOMAIN set to actual domain (HTTPS)
- [ ] Port 3000 configured for webhook
- [ ] Health endpoint working on port 4000
- [ ] Config validation passes on startup

## Deployment

### Docker Setup
- [ ] Dockerfile built successfully
- [ ] Multi-stage build reduces image size
- [ ] Non-root user configured
- [ ] Health check implemented
- [ ] Docker image tagged correctly
- [ ] docker-compose.yml configured
- [ ] Environment variables passed to container

### Webhook Configuration
- [ ] Webhook URL set via Telegram API
- [ ] Webhook secret verified in requests
- [ ] Webhook endpoint returns 200 for valid requests
- [ ] Webhook endpoint returns 403 for invalid secret
- [ ] getWebhookInfo confirms webhook is active

### Monitoring & Logging
- [ ] Health endpoint returns "healthy"
- [ ] All services report "ok" status (telegram, gemini, memwal)
- [ ] Logs being written (check log volume in Docker)
- [ ] Error logs reviewed for issues
- [ ] Alerting configured for failures
- [ ] Uptime monitoring enabled

### Performance
- [ ] Response time < 2s for typical queries
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage reasonable under load
- [ ] Rate limiting handled gracefully
- [ ] Concurrent user sessions work correctly

## Post-Deployment

### Validation
- [ ] Bot responds to /start command
- [ ] Bot processes natural language queries
- [ ] Quiz feature works end-to-end
- [ ] Progress tracking displays correctly
- [ ] Memory system stores and recalls data
- [ ] Health check accessible externally

### Real User Testing
- [ ] 3+ students invited to test
- [ ] Testing period: 1-2 weeks
- [ ] Feedback collected via forms/surveys
- [ ] Bug reports prioritized and fixed
- [ ] Performance metrics collected
- [ ] User engagement tracked

### Security
- [ ] Sensitive data not logged
- [ ] API keys not exposed in responses
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting prevents abuse
- [ ] Input validation prevents injection
- [ ] CORS configured correctly
- [ ] Secrets rotated after deployment

### Backup & Disaster Recovery
- [ ] Regular backups configured
- [ ] Rollback procedure documented
- [ ] Kill switch implemented (ability to disable bot)
- [ ] Data migration plan (if needed)
- [ ] Disaster recovery tested

## Monitoring & Maintenance

### Daily Checks
- [ ] Bot responding to messages
- [ ] Health endpoint returns healthy
- [ ] Error rate < 1%
- [ ] No out-of-memory errors
- [ ] Webhook is receiving updates

### Weekly Checks
- [ ] Review error logs
- [ ] Check uptime > 99%
- [ ] Verify backups completed
- [ ] Update dependencies if needed
- [ ] Monitor performance trends

### Monthly Checks
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Cost analysis
- [ ] User feedback review
- [ ] Update documentation

## Scaling Preparation

- [ ] Load testing completed (100+ concurrent users)
- [ ] Database/storage can scale
- [ ] API rate limits acceptable
- [ ] Caching strategy in place
- [ ] Horizontal scaling possible
- [ ] Monitoring alerts configured

## Documentation

- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT.md complete and tested
- [ ] QUICKSTART.md clear and accurate
- [ ] API documentation current
- [ ] Architecture documentation up-to-date
- [ ] Runbook for common issues created
- [ ] On-call procedures documented

## Sign-Off

- [ ] QA testing completed
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Documentation complete
- [ ] Team trained on operation
- [ ] Stakeholders approved deployment

**Deployment Date**: _______________
**Deployed By**: _______________
**Approved By**: _______________

---

## Rollback Procedure

If critical issues are discovered:

1. Disable Telegram webhook: `curl -X POST https://api.telegram.org/bot${TOKEN}/setWebhook -d "url="`
2. Switch to polling mode or revert to previous version
3. Investigate root cause
4. Fix and test thoroughly
5. Re-deploy with new version

## Emergency Contacts

- Telegram Support: [@BotFather](https://t.me/botfather)
- Gemini Support: [Google AI Help](https://support.google.com/)
- Walrus Support: [Walrus Docs](https://docs.walrus.site/)
- Hosting Provider Support: [Your Provider's Support]
