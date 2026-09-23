from django.conf import settings
from django.db import models


class SurvivalRun(models.Model):
    """
    One complete Survival Round run for a player.

    A player can have multiple runs because pressing RESET
    starts a new run, while the previous run remains in history.
    """

    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("ABANDONED", "Abandoned"),
    ]

    player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="survival_runs",
    )

    current_level = models.PositiveSmallIntegerField(default=1)

    survival_day = models.PositiveIntegerField(default=1)

    # IntegerField allows both positive and negative scores.
    total_score = models.IntegerField(default=0)

    total_attempts = models.PositiveIntegerField(default=0)

    total_deaths = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="IN_PROGRESS",
    )

    started_at = models.DateTimeField(auto_now_add=True)

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return (
            f"{self.player} - "
            f"Survival Run #{self.id}"
        )


class SurvivalLevelProgress(models.Model):
    STATUS_CHOICES = [
        ("LOCKED", "Locked"),
        ("AVAILABLE", "Available"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    survival_run = models.ForeignKey(
        SurvivalRun,
        on_delete=models.CASCADE,
        related_name="level_progress",
    )

    level_number = models.PositiveSmallIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="LOCKED",
    )

    # IntegerField allows a negative best score if
    # a level only contains penalty points.
    best_score = models.IntegerField(default=0)

    attempts = models.PositiveIntegerField(default=0)

    deaths = models.PositiveIntegerField(default=0)

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["level_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["survival_run", "level_number"],
                name="unique_survival_run_level",
            )
        ]

    def __str__(self):
        return (
            f"{self.survival_run.player} - "
            f"Level {self.level_number}"
        )


class SurvivalAttempt(models.Model):
    RESULT_CHOICES = [
        ("WIN", "Win"),
        ("LOSS", "Loss"),
        ("DEATH", "Death"),
        ("RESET", "Reset"),
        ("TIMEOUT", "Timeout"),
    ]

    survival_run = models.ForeignKey(
        SurvivalRun,
        on_delete=models.CASCADE,
        related_name="attempt_history",
    )

    level_number = models.PositiveSmallIntegerField()

    attempt_number = models.PositiveIntegerField()

    survival_day = models.PositiveIntegerField()

    # IntegerField allows positive and negative attempt scores.
    score = models.IntegerField(default=0)

    result = models.CharField(
        max_length=20,
        choices=RESULT_CHOICES,
    )

    is_death = models.BooleanField(default=False)

    started_at = models.DateTimeField(
        auto_now_add=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return (
            f"{self.survival_run.player} - "
            f"Level {self.level_number} - "
            f"Attempt {self.attempt_number}"
        )


class SurvivalInventory(models.Model):
    survival_run = models.OneToOneField(
        SurvivalRun,
        on_delete=models.CASCADE,
        related_name="inventory",
    )

    ticket = models.BooleanField(default=False)

    map_collected = models.BooleanField(default=False)

    fuel_can = models.BooleanField(default=False)

    key_1 = models.BooleanField(default=False)

    key_2 = models.BooleanField(default=False)

    key_3 = models.BooleanField(default=False)

    glass_bridge_completed = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.survival_run.player} - Inventory"

    def has_all_required_items(self):
        return (
            self.ticket
            and self.map_collected
            and self.fuel_can
            and self.key_1
            and self.key_2
            and self.key_3
            and self.glass_bridge_completed
        )