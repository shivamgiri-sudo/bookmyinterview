# API Contract

Base URL: `/api`

## Intake
POST `/intake/analyze`  
Creates assessment path, JD output, and trait question set from client requirement.

POST `/assessment/path`  
Returns dynamic assessment path based on role/dependency scores/client overrides.

## Trait Engine
POST `/traits/generate`  
Auto-generates trait questions and validation status.

POST `/traits/evaluate`  
Scores a candidate trait response.

## Audio/Video
POST `/audio/evaluate`  
Evaluates transcript quality for Voice Level 3 or 5. Production adapter should use STT and pronunciation model.

POST `/video/evaluate`  
Evaluates transcript-based video response. Protected attributes must not be scored.

## Candidate
POST `/resume/parse`  
Resume parser adapter endpoint.

POST `/candidate/score`  
Computes weighted explainable candidate recommendation.

## Interview
POST `/interviews/book`  
Books digital/physical slot and returns meeting link placeholder.

## Admin
GET `/admin/acceptance-checklist`  
Shows mapped modules from the blueprint.
