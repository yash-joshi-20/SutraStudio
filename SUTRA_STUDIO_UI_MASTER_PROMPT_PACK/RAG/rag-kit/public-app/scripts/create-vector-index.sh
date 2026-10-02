#!/usr/bin/env bash
# Creates the Firestore composite vector index used by lib/rag/retrieve.ts
# (pre-filter on clientId + nearest-neighbour search on embedding).
# Run once per Firebase project. The index takes a few minutes to build.
# Requires: gcloud CLI logged in with access to the project.
#   gcloud config set project YOUR_PROJECT_ID
# DIMENSION must equal EMBEDDING_DIMS (default 768).
set -euo pipefail
DIMENSION="${EMBEDDING_DIMS:-768}"

gcloud alpha firestore indexes composite create \
  --collection-group=brandKnowledge \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=clientId \
  --field-config=field-path=embedding,vector-config="{\"dimension\":\"${DIMENSION}\",\"flat\":\"{}\"}" \
  --database="(default)"

echo "Check progress with: gcloud alpha firestore indexes composite list --database='(default)'"
