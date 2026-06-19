from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.message_templates import list_message_templates, render_message_template

template_router = APIRouter()

class TemplatePreviewPayload(BaseModel):
    template_key: str = "assessment_invite"
    variables: dict[str, str] = Field(default_factory=dict)

@template_router.get("/library")
def library():
    return list_message_templates()

@template_router.post("/preview")
def preview(payload: TemplatePreviewPayload):
    return render_message_template(payload.template_key, payload.variables)
