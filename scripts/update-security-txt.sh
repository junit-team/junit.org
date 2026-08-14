#!/usr/bin/env bash
# Regenerate  .well-known/security.txt (RFC 9116).
# Requires the OpenPGP *private* key for security@junit.org in the local gpg keyring.
set -euo pipefail

KEY="0152DA30EABC7ABADCB09D10D9A6B1329D191D25"
OUT="$(cd "$(dirname "$0")/.." && pwd)/.well-known/security.txt"
EXPIRES="$(date -u -d '+1 year' +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "$(dirname "$OUT")"

gpg --clearsign --yes --local-user "$KEY" --digest-algo SHA256 --output "$OUT" <<EOF
Contact: mailto:security@junit.org
Contact: https://github.com/junit-team/junit-framework/security/advisories/new
Encryption: https://keys.openpgp.org/search?q=security%40junit.org
Policy: https://github.com/junit-team/junit-framework/security/policy
Preferred-Languages: en
Canonical: https://junit.org/.well-known/security.txt
Expires: $EXPIRES
EOF

echo "Wrote $OUT (Expires: $EXPIRES). Review, then commit."
