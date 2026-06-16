import logging
from models.campaign import CampaignStatus, VALID_TRANSITIONS

logger = logging.getLogger(__name__)

class StateTransitionError(Exception):
    def __init__(self, current: CampaignStatus, target: CampaignStatus):
        self.current = current
        self.target = target
        super().__init__(
            f"SYSTEM FAILURE: Invalid state transition {current} → {target}. "
            f"Valid transitions: {[s.value for s in VALID_TRANSITIONS.get(current, [])]}"
        )

class StateMachine:
    def __init__(self, current_state: CampaignStatus = CampaignStatus.CREATED):
        self._state = current_state

    @property
    def state(self) -> CampaignStatus:
        return self._state

    def transition(self, target: CampaignStatus) -> CampaignStatus:
        allowed = VALID_TRANSITIONS.get(self._state, [])
        if target not in allowed:
            logger.critical(
                "ILLEGAL STATE TRANSITION: %s → %s | Allowed: %s",
                self._state.value, target.value,
                [s.value for s in allowed]
            )
            raise StateTransitionError(self._state, target)

        logger.info("State transition: %s → %s", self._state.value, target.value)
        self._state = target
        return self._state

    def can_transition(self, target: CampaignStatus) -> bool:
        return target in VALID_TRANSITIONS.get(self._state, [])

    def is_terminal(self) -> bool:
        return self._state in (CampaignStatus.COMPLETED, CampaignStatus.FAILED)
