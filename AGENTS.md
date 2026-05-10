<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bomb-Proof Safety Protocol
1. **Revert-on-Error**: If a change causes a build error, logic failure, or regression, DO NOT "fix forward". Immediately run `git checkout <file>` to revert to the last known good state before attempting a new approach.
2. **Build Barrier**: Run `npm run build` after EVERY file change. Do not move to the next file until the build is green.
3. **Architectural Truth**: In the FENZ Roster Engine, an `accepted` offer in `ot_offers` MUST be promoted to `ot_assignments` and the `ot_requests.number_filled` MUST be incremented immediately. The system has no background cron jobs or automated cycles.

