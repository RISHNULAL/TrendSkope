"""Recommendation and explanation engine for pre-publication content optimization."""
from .analyzer import generate_content_report
from .audit_studio import compute_content_audit_studio
from .comparison_studio import compare_scenarios_comprehensive, get_scenario_templates

__all__ = [
    "generate_content_report",
    "compute_content_audit_studio",
    "compare_scenarios_comprehensive",
    "get_scenario_templates",
]
