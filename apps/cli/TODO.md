# TODO

## Completed ✅

- ✅ File synchronization when setting secrets (updates `.dev.vars`)
- ✅ Pre/post deployment verification of local files
- ✅ Show sync status in UI (secrets and deployment)
- ✅ Automatic timestamp tracking in `.dev.vars`

## In Progress 🚧

- [ ] Bidirectional sync (pull secrets from Workers to local)
- [ ] Edit `wrangler.toml` through CLI (worker name, vars)
- [ ] Automatic backups before file modifications
- [ ] Conflict detection (local vs remote differences)

## Planned 📋

### High Priority

- [ ] Rollback support (restore from backups)
- [ ] Sync status dashboard (show all file states)
- [ ] Pull configuration from deployed worker
- [ ] Validate `wrangler.toml` before deployment

### Medium Priority

- [ ] Environment-specific configurations (production/staging)
- [ ] Bulk secret import/export
- [ ] Configuration diff viewer (local vs deployed)
- [ ] Secret rotation workflow

### Low Priority

- [ ] Configuration templates
- [ ] Multi-worker management
- [ ] Deployment history viewer
- [ ] Configuration migration tools

## Documentation

- ✅ FILE-SYNC.md - Comprehensive file sync guide
- ✅ FIXES.md - Bug fixes and resolutions
- ✅ SOLUTION.md - Technical implementation
- [ ] VIDEO-TUTORIAL.md - Screen recording guide
- [ ] MIGRATION-GUIDE.md - Upgrading from v1 to v2

## Known Issues

None currently! 🎉

## Feature Requests

Add feature requests here as they come up.
