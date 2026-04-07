from app.services.validation import validate_design


def test_validation_rejects_guest_storage_uplink_overlap(sample_design: dict) -> None:
    sample_design["networking"]["guestPortgroups"][0]["activeUplinks"] = ["Uplink1"]

    result = validate_design(sample_design)

    assert not result.valid
    assert any("Guest traffic cannot use storage uplinks" in error.message for error in result.errors)

