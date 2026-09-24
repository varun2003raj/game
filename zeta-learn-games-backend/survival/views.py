from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone
from django.db import transaction

from .models import (
    SurvivalRun,
    SurvivalLevelProgress,
    SurvivalAttempt,
    SurvivalInventory,
)
from .serializers import SurvivalRunSerializer


# =========================================================
# CURRENT SURVIVAL RUN
# =========================================================

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def survival_current(request):

    user = request.user

    run = (
        SurvivalRun.objects
        .filter(
            player=user,
            status="IN_PROGRESS",
        )
        .first()
    )

    # ---------------------------------------------------------
    # CREATE FIRST RUN ONLY IF NO ACTIVE RUN EXISTS
    # ---------------------------------------------------------

    if not run:

        run = SurvivalRun.objects.create(
            player=user,
            current_level=1,
            survival_day=1,
            total_score=0,
            total_attempts=0,
            total_deaths=0,
            status="IN_PROGRESS",
        )

        SurvivalLevelProgress.objects.create(
            survival_run=run,
            level_number=1,
            status="AVAILABLE",
        )

        SurvivalInventory.objects.create(
            survival_run=run
        )

    # ---------------------------------------------------------
    # MAKE SURE INVENTORY EXISTS
    # ---------------------------------------------------------

    try:
        run.inventory

    except SurvivalInventory.DoesNotExist:

        SurvivalInventory.objects.create(
            survival_run=run
        )

    # ---------------------------------------------------------
    # RETURN CURRENT RUN
    # ---------------------------------------------------------

    serializer = SurvivalRunSerializer(run)

    return Response(serializer.data)


# =========================================================
# COMPLETE SURVIVAL LEVEL
# =========================================================

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def complete_survival_level(request):

    user = request.user

    level_number = request.data.get("level")
    result = request.data.get("result")

    # ---------------------------------------------------------
    # GAMEPLAY VALUES
    # ---------------------------------------------------------

    completion_time = request.data.get(
        "completion_time",
        0
    )

    round_wins = request.data.get(
        "round_wins",
        0
    )

    round_losses = request.data.get(
        "round_losses",
        0
    )

    keys_collected = request.data.get(
        "keys_collected",
        0
    )

    monster_chase_seconds = request.data.get(
        "monster_chase_seconds",
        0
    )

    # ---------------------------------------------------------
    # VALIDATE REQUIRED VALUES
    # ---------------------------------------------------------

    if not level_number or not result:

        return Response(
            {
                "detail": "level and result are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # CONVERT GAMEPLAY VALUES
    # ---------------------------------------------------------

    try:

        level_number = int(level_number)

        completion_time = max(
            0,
            int(completion_time)
        )

        round_wins = max(
            0,
            int(round_wins)
        )

        round_losses = max(
            0,
            int(round_losses)
        )

        keys_collected = max(
            0,
            min(3, int(keys_collected))
        )

        monster_chase_seconds = max(
            0,
            int(monster_chase_seconds)
        )

    except (TypeError, ValueError):

        return Response(
            {
                "detail": "Invalid gameplay values."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # VALIDATE LEVEL
    # ---------------------------------------------------------

    if level_number < 1 or level_number > 5:

        return Response(
            {
                "detail": "Invalid level."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # VALIDATE RESULT
    # ---------------------------------------------------------

    valid_results = [
        "WIN",
        "LOSS",
        "DEATH",
    ]

    if result not in valid_results:

        return Response(
            {
                "detail": "Invalid result."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # GET ACTIVE SURVIVAL RUN
    # ---------------------------------------------------------

    run = (
        SurvivalRun.objects
        .filter(
            player=user,
            status="IN_PROGRESS",
        )
        .first()
    )

    if not run:

        return Response(
            {
                "detail": "No active Survival run."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # ---------------------------------------------------------
    # GET LEVEL PROGRESS
    # ---------------------------------------------------------

    try:

        level_progress = (
            SurvivalLevelProgress.objects.get(
                survival_run=run,
                level_number=level_number,
            )
        )

    except SurvivalLevelProgress.DoesNotExist:

        return Response(
            {
                "detail": "Level progress not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # ---------------------------------------------------------
    # ATTEMPT NUMBER
    # ---------------------------------------------------------

    attempt_number = (
        SurvivalAttempt.objects.filter(
            survival_run=run,
            level_number=level_number,
        ).count()
        + 1
    )

    # ---------------------------------------------------------
    # CHECK RESULT TYPE
    # ---------------------------------------------------------

    is_death = result == "DEATH"

    # ---------------------------------------------------------
    # INITIAL SCORE
    # ---------------------------------------------------------

    score_change = 0

    # ---------------------------------------------------------
    # CHECK IF LEVEL ALREADY COMPLETED
    # ---------------------------------------------------------

    already_completed = (
        level_progress.status == "COMPLETED"
    )

    # =========================================================
    # LEVEL 1 - COIN CHALLENGE
    # =========================================================

    if level_number == 1:

        if result == "WIN":

            if not already_completed:

                score_change += 1000

        elif result == "LOSS":

            # Player missed the last train.
            # This is NOT a death.
            # Move to the next survival day.

            score_change -= 50

            run.survival_day += 1

    # =========================================================
    # LEVEL 2 - RED LIGHT / GREEN LIGHT
    # =========================================================

    elif level_number == 2:

        if result == "WIN":

            remaining_time = max(
                0,
                300 - completion_time
            )

            if not already_completed:

                score_change += remaining_time
                score_change += 500

    # =========================================================
    # LEVEL 3 - MARBLES
    # =========================================================

    elif level_number == 3:

        if result == "WIN":

            remaining_time = max(
                0,
                300 - completion_time
            )

            if not already_completed:

                score_change += remaining_time

                score_change += (
                    round_wins * 10
                )

                score_change -= (
                    round_losses * 15
                )

                score_change += 500

    # =========================================================
    # LEVEL 4 - MONSTER ESCAPE
    # =========================================================

    elif level_number == 4:

        if result == "WIN":

            remaining_time = max(
                0,
                300 - completion_time
            )

            if not already_completed:

                score_change += remaining_time

                score_change += (
                    keys_collected * 50
                )

                score_change -= (
                    monster_chase_seconds * 5
                )

                score_change += 500

    # =========================================================
    # LEVEL 5 - GLASS BRIDGE
    # =========================================================

    elif level_number == 5:

        if result == "WIN":

            if not already_completed:

                score_change += 250

    # =========================================================
    # GLOBAL DEATH PENALTY
    # =========================================================

    if is_death:

        level_progress.deaths += 1

        run.total_deaths += 1

        # Death penalty
        score_change -= 50

        # New survival day penalty
        score_change -= 50

        # Move to next survival day
        run.survival_day += 1

    # =========================================================
    # CREATE ATTEMPT
    # =========================================================

    attempt = SurvivalAttempt.objects.create(
        survival_run=run,
        level_number=level_number,
        attempt_number=attempt_number,
        survival_day=run.survival_day,
        score=score_change,
        result=result,
        is_death=is_death,
        completed_at=timezone.now(),
    )

    # =========================================================
    # UPDATE RUN
    # =========================================================

    run.total_attempts += 1

    run.total_score += score_change

    level_progress.attempts += 1

    # =========================================================
    # LEVEL WIN
    # =========================================================

    if result == "WIN":

        # -----------------------------------------------------
        # MARK CURRENT LEVEL COMPLETED
        # -----------------------------------------------------

        level_progress.status = "COMPLETED"

        level_progress.best_score = max(
            level_progress.best_score,
            score_change,
        )

        level_progress.completed_at = timezone.now()

        # =====================================================
        # LEVEL 1 -> LEVEL 2
        # =====================================================

        if level_number == 1:

            inventory, _ = (
                SurvivalInventory.objects.get_or_create(
                    survival_run=run
                )
            )

            # Give travel ticket
            inventory.ticket = True

            inventory.save()

            # Unlock Level 2
            run.current_level = 2

            SurvivalLevelProgress.objects.get_or_create(
                survival_run=run,
                level_number=2,
                defaults={
                    "status": "AVAILABLE"
                },
            )

        # =====================================================
        # LEVEL 2 -> LEVEL 3
        # =====================================================

        elif level_number == 2:

            inventory, _ = (
                SurvivalInventory.objects.get_or_create(
                    survival_run=run
                )
            )

            # Give Map
            inventory.map_collected = True

            inventory.save()

            # Unlock Level 3
            run.current_level = 3

            SurvivalLevelProgress.objects.get_or_create(
                survival_run=run,
                level_number=3,
                defaults={
                    "status": "AVAILABLE"
                },
            )

        # =====================================================
        # LEVEL 3 -> LEVEL 4
        # =====================================================

        elif level_number == 3:

            inventory, _ = (
                SurvivalInventory.objects.get_or_create(
                    survival_run=run
                )
            )

            # -------------------------------------------------
            # LEVEL 3 REWARD
            # -------------------------------------------------
            # Player completed Marbles.
            # Give the Fuel Can.
            # -------------------------------------------------

            inventory.fuel_can = True

            inventory.save()

            # Unlock Level 4
            run.current_level = 4

            SurvivalLevelProgress.objects.get_or_create(
                survival_run=run,
                level_number=4,
                defaults={
                    "status": "AVAILABLE"
                },
            )

        # =====================================================
        # LEVEL 4 -> LEVEL 5
        # =====================================================

        elif level_number == 4:

            inventory, _ = (
                SurvivalInventory.objects.get_or_create(
                    survival_run=run
                )
            )

            # -------------------------------------------------
            # LEVEL 4 REWARD
            # -------------------------------------------------
            # Player completed Hide & Seek.
            # Give all 3 keys.
            # -------------------------------------------------

            inventory.key_1 = True
            inventory.key_2 = True
            inventory.key_3 = True

            inventory.save()

            # Unlock Level 5
            run.current_level = 5

            SurvivalLevelProgress.objects.get_or_create(
                survival_run=run,
                level_number=5,
                defaults={
                    "status": "AVAILABLE"
                },
            )

        # =====================================================
        # LEVEL 5 -> FINAL DOOR
        # =====================================================

        elif level_number == 5:

            # IMPORTANT:
            #
            # DO NOT mark the run COMPLETED here.
            #
            # Level 6 / Final Door uses this same run.
            #

            run.current_level = 5

            inventory, _ = (
                SurvivalInventory.objects.get_or_create(
                    survival_run=run
                )
            )

            # Mark Glass Bridge completed
            inventory.glass_bridge_completed = True

            inventory.save()

            # Keep run IN_PROGRESS.
            # Level 6 will finish the survival run.

    # =========================================================
    # SAVE RUN
    # =========================================================

    run.save()

    # =========================================================
    # SAVE LEVEL PROGRESS
    # =========================================================

    level_progress.save()

    # =========================================================
    # CHECK FIVE-LEVEL COMPLETION
    # =========================================================

    all_five_completed = (
        SurvivalLevelProgress.objects.filter(
            survival_run=run,
            level_number__in=[1, 2, 3, 4, 5],
            status="COMPLETED",
        ).count()
        == 5
    )

    # =========================================================
    # RESPONSE
    # =========================================================

    return Response(
        {
            "message": "Survival attempt recorded.",

            "score_change": score_change,

            "game_completed": all_five_completed,

            "final_door_unlocked": all_five_completed,

            "attempt": {
                "level": attempt.level_number,
                "attempt_number": attempt.attempt_number,
                "survival_day": attempt.survival_day,
                "score": attempt.score,
                "result": attempt.result,
                "is_death": attempt.is_death,
            },

            "run": {
                "current_level": run.current_level,
                "survival_day": run.survival_day,
                "total_score": run.total_score,
                "total_attempts": run.total_attempts,
                "total_deaths": run.total_deaths,
                "status": run.status,
            },
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# RESET SURVIVAL ROUND
# =========================================================

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def reset_survival_run(request):

    user = request.user

    # =========================================================
    # GET CURRENT ACTIVE RUN
    # =========================================================

    current_run = (
        SurvivalRun.objects
        .filter(
            player=user,
            status="IN_PROGRESS",
        )
        .first()
    )

    # =========================================================
    # STORE OLD RUN ID
    # =========================================================

    previous_run_id = (
        str(current_run.id)
        if current_run
        else None
    )

    # =========================================================
    # CREATE NEW RUN
    # =========================================================

    with transaction.atomic():

        # -----------------------------------------------------
        # MARK OLD RUN AS ABANDONED
        # -----------------------------------------------------

        if current_run:

            current_run.status = "ABANDONED"

            current_run.completed_at = timezone.now()

            current_run.save()

        # -----------------------------------------------------
        # CREATE FRESH SURVIVAL RUN
        # -----------------------------------------------------

        new_run = SurvivalRun.objects.create(
            player=user,
            current_level=1,
            survival_day=1,
            total_score=0,
            total_attempts=0,
            total_deaths=0,
            status="IN_PROGRESS",
        )

        # -----------------------------------------------------
        # CREATE LEVEL 1
        # -----------------------------------------------------

        SurvivalLevelProgress.objects.create(
            survival_run=new_run,
            level_number=1,
            status="AVAILABLE",
            best_score=0,
            attempts=0,
            deaths=0,
        )

        # -----------------------------------------------------
        # CREATE LOCKED LEVELS
        # -----------------------------------------------------

        for level_number in range(2, 6):

            SurvivalLevelProgress.objects.create(
                survival_run=new_run,
                level_number=level_number,
                status="LOCKED",
                best_score=0,
                attempts=0,
                deaths=0,
            )

        # -----------------------------------------------------
        # CREATE EMPTY INVENTORY
        # -----------------------------------------------------

        SurvivalInventory.objects.create(
            survival_run=new_run,
            ticket=False,
            map_collected=False,
            fuel_can=False,
            key_1=False,
            key_2=False,
            key_3=False,
            glass_bridge_completed=False,
        )

    # =========================================================
    # RESPONSE
    # =========================================================

    return Response(
        {
            "message": "Survival Round has been reset.",

            "previous_run": previous_run_id,

            "new_run": {
                "id": str(new_run.id),
                "current_level": new_run.current_level,
                "survival_day": new_run.survival_day,
                "total_score": new_run.total_score,
                "total_attempts": new_run.total_attempts,
                "total_deaths": new_run.total_deaths,
                "status": new_run.status,
            },
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# SURVIVAL LEADERBOARD
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def survival_leaderboard(request):

    # Get the latest run for each player.
    runs = (
        SurvivalRun.objects
        .select_related("player")
        .order_by(
            "player_id",
            "-started_at",
        )
    )

    latest_runs = {}

    for run in runs:

        if run.player_id not in latest_runs:

            latest_runs[run.player_id] = run

    runs = list(latest_runs.values())

    # ---------------------------------------------------------
    # SORT LEADERBOARD
    # ---------------------------------------------------------

    runs.sort(
        key=lambda run: (
            -run.total_score,
            run.total_deaths,
            run.survival_day,
        )
    )

    rankings = []

    for index, run in enumerate(runs, start=1):

        rankings.append(
            {
                "rank": index,
                "player": run.player.username,
                "level": min(
                    run.current_level,
                    5,
                ),
                "died": run.total_deaths,
                "days": run.survival_day,
                "score": run.total_score,
            }
        )

    # ---------------------------------------------------------
    # AVERAGE SURVIVAL
    # ---------------------------------------------------------

    total_players = len(runs)

    if total_players:

        average_deaths = round(
            sum(
                run.total_deaths
                for run in runs
            ) / total_players,
            2,
        )

        average_days = round(
            sum(
                run.survival_day
                for run in runs
            ) / total_players,
            2,
        )

        average_score = round(
            sum(
                run.total_score
                for run in runs
            ) / total_players,
            2,
        )

    else:

        average_deaths = 0
        average_days = 0
        average_score = 0

    # ---------------------------------------------------------
    # YOUR SURVIVAL
    # ---------------------------------------------------------

    your_run = latest_runs.get(
        request.user.id
    )

    if your_run:

        your_survival = {
            "current_level": min(
                your_run.current_level,
                5,
            ),
            "survival_day": your_run.survival_day,
            "total_deaths": your_run.total_deaths,
            "score": your_run.total_score,
        }

    else:

        your_survival = {
            "current_level": 1,
            "survival_day": 1,
            "total_deaths": 0,
            "score": 0,
        }

    # ---------------------------------------------------------
    # SURVIVAL STATISTICS
    # ---------------------------------------------------------

    players_reached = []

    for level in range(1, 6):

        count = sum(
            1
            for run in runs
            if run.current_level >= level
        )

        players_reached.append(
            {
                "level": level,
                "players": count,
            }
        )

    # ---------------------------------------------------------
    # LEVEL STATISTICS
    # ---------------------------------------------------------

    level_statistics = []

    for level in range(1, 6):

        level_runs = [
            run
            for run in runs
            if run.current_level >= level
        ]

        if level_runs:

            avg_score = round(
                sum(
                    run.total_score
                    for run in level_runs
                ) / len(level_runs),
                2,
            )

            avg_deaths = round(
                sum(
                    run.total_deaths
                    for run in level_runs
                ) / len(level_runs),
                2,
            )

        else:

            avg_score = 0
            avg_deaths = 0

        level_statistics.append(
            {
                "level": level,
                "players": len(level_runs),
                "average_score": avg_score,
                "average_deaths": avg_deaths,
            }
        )

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return Response(
        {
            "rankings": rankings,

            "average_survival": {
                "deaths": average_deaths,
                "days": average_days,
                "score": average_score,
            },

            "your_survival": your_survival,

            "statistics": {
                "players_reached": players_reached,
                "level_statistics": level_statistics,
            },
        }
    )