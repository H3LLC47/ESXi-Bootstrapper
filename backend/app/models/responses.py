from pydantic import BaseModel


class ValidationMessage(BaseModel):
    severity: str
    path: str
    message: str


class ValidationResponse(BaseModel):
    valid: bool
    errors: list[ValidationMessage]
    warnings: list[ValidationMessage]
    normalized_config: dict | None = None


class PlanStep(BaseModel):
    title: str
    detail: str


class GenerationResponse(BaseModel):
    valid: bool
    errors: list[ValidationMessage]
    warnings: list[ValidationMessage]
    deployment_plan: list[PlanStep]
    powercli_script: str
    normalized_config: dict | None = None

