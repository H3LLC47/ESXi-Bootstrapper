import json
from pathlib import Path

from fastapi import APIRouter

from app.models.design import DesignConfig
from app.models.responses import GenerationResponse, ValidationResponse
from app.services.planner import build_deployment_plan
from app.services.powercli import generate_powercli
from app.services.validation import validate_design


router = APIRouter(prefix="/designs", tags=["designs"])
SCHEMA_PATH = Path(__file__).resolve().parents[2] / "schemas" / "design.schema.json"


@router.get("/schema")
def schema() -> dict:
    with SCHEMA_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@router.post("/validate", response_model=ValidationResponse)
def validate(payload: dict) -> ValidationResponse:
    return validate_design(payload)


@router.post("/generate", response_model=GenerationResponse)
def generate(payload: dict) -> GenerationResponse:
    validation = validate_design(payload)
    if not validation.valid or not validation.normalized_config:
        return GenerationResponse(
            valid=False,
            errors=validation.errors,
            warnings=validation.warnings,
            deployment_plan=[],
            powercli_script="",
            normalized_config=validation.normalized_config,
        )

    config = DesignConfig.model_validate(validation.normalized_config)
    plan = build_deployment_plan(config)
    script = generate_powercli(config)
    return GenerationResponse(
        valid=True,
        errors=validation.errors,
        warnings=validation.warnings,
        deployment_plan=plan,
        powercli_script=script,
        normalized_config=validation.normalized_config,
    )
