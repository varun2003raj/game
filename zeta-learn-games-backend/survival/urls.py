from django.urls import path
from . import views

from .views import (
    survival_current,
    complete_survival_level,
    survival_leaderboard,
)

urlpatterns = [
    path("", survival_current, name="survival-current"),

    path(
        "level/complete/",
        complete_survival_level,
        name="survival-level-complete",
    ),

    path(
        "leaderboard/",
        survival_leaderboard,
        name="survival-leaderboard",
    ),

    path(
        "reset/",
        views.reset_survival_run,
        name="reset-survival-run",
    ),
]