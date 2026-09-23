from rest_framework import serializers

from .models import (
    SurvivalRun,
    SurvivalLevelProgress,
    SurvivalAttempt,
    SurvivalInventory,
)


class SurvivalInventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = SurvivalInventory

        fields = [
            "ticket",
            "map_collected",
            "fuel_can",
            "key_1",
            "key_2",
            "key_3",
            "glass_bridge_completed",
        ]


class SurvivalLevelProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = SurvivalLevelProgress

        fields = [
            "level_number",
            "status",
            "best_score",
            "attempts",
            "deaths",
            "started_at",
            "completed_at",
        ]


class SurvivalAttemptSerializer(serializers.ModelSerializer):

    class Meta:
        model = SurvivalAttempt

        fields = [
            "level_number",
            "attempt_number",
            "survival_day",
            "score",
            "result",
            "is_death",
            "started_at",
            "completed_at",
        ]


class SurvivalRunSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)

    inventory = SurvivalInventorySerializer(
        read_only=True
    )

    level_progress = SurvivalLevelProgressSerializer(
        many=True,
        read_only=True
    )

    attempt_history = SurvivalAttemptSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = SurvivalRun

        fields = [
            "id",
            "current_level",
            "survival_day",
            "total_score",
            "total_attempts",
            "total_deaths",
            "status",
            "started_at",
            "completed_at",
            "inventory",
            "level_progress",
            "attempt_history",
        ]