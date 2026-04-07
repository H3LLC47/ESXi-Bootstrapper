from app.models.design import DesignConfig
from app.services.planner import build_deployment_plan
from app.services.powercli import generate_powercli


def test_powercli_generation_contains_dedicated_portgroups(sample_design: dict) -> None:
    config = DesignConfig.model_validate(sample_design)

    script = generate_powercli(config)
    plan = build_deployment_plan(config)

    assert "DVPG-MGMT" in script
    assert "DVPG-STORAGE-A" in script
    assert len(plan) >= 6

