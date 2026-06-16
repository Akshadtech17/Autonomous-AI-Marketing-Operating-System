import logging
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set
from enum import Enum

logger = logging.getLogger(__name__)

class NodeStatus(str, Enum):
    PENDING = "PENDING"
    READY = "READY"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

@dataclass
class DAGNode:
    task_id: str
    agent_name: str
    dependencies: List[str] = field(default_factory=list)
    status: NodeStatus = NodeStatus.PENDING
    output: Optional[dict] = None
    error: Optional[str] = None

@dataclass
class DAGExecutionPlan:
    campaign_id: str
    nodes: Dict[str, DAGNode] = field(default_factory=dict)
    execution_order: List[List[str]] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "campaign_id": self.campaign_id,
            "nodes": {
                k: {
                    "task_id": v.task_id,
                    "agent_name": v.agent_name,
                    "dependencies": v.dependencies,
                    "status": v.status.value,
                }
                for k, v in self.nodes.items()
            },
            "execution_order": self.execution_order,
        }

class DAGEngine:
    AGENT_SEQUENCE = [
        ("research_task", "research_agent"),
        ("seo_task", "seo_agent"),
        ("content_task", "content_agent"),
        ("social_task", "social_agent"),
        ("analytics_task", "analytics_agent"),
        ("creative_task", "creative_director_agent"),
        ("report_task", "report_agent"),
    ]

    def build_plan(self, campaign_id: str) -> DAGExecutionPlan:
        plan = DAGExecutionPlan(campaign_id=campaign_id)

        for i, (task_id, agent_name) in enumerate(self.AGENT_SEQUENCE):
            deps = []
            if i > 0:
                deps = [self.AGENT_SEQUENCE[i - 1][0]]
            node = DAGNode(
                task_id=task_id,
                agent_name=agent_name,
                dependencies=deps,
            )
            plan.nodes[task_id] = node

        plan.execution_order = self._topological_sort(plan.nodes)
        self._validate_dag(plan)
        logger.info("DAG built for campaign %s: %s", campaign_id, plan.execution_order)
        return plan

    def _topological_sort(self, nodes: Dict[str, DAGNode]) -> List[List[str]]:
        in_degree: Dict[str, int] = {k: len(v.dependencies) for k, v in nodes.items()}
        adj: Dict[str, List[str]] = {k: [] for k in nodes}

        for task_id, node in nodes.items():
            for dep in node.dependencies:
                adj[dep].append(task_id)

        levels: List[List[str]] = []
        queue = [tid for tid, deg in in_degree.items() if deg == 0]

        while queue:
            levels.append(sorted(queue))
            next_queue = []
            for tid in queue:
                for neighbor in adj[tid]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_queue.append(neighbor)
            queue = next_queue

        resolved = sum(len(lvl) for lvl in levels)
        if resolved != len(nodes):
            raise ValueError("DAG contains a cycle — execution plan is invalid")

        return levels

    def _validate_dag(self, plan: DAGExecutionPlan):
        for node in plan.nodes.values():
            for dep in node.dependencies:
                if dep not in plan.nodes:
                    raise ValueError(
                        f"DAG VIOLATION: task '{node.task_id}' depends on unknown task '{dep}'"
                    )
        logger.debug("DAG validation passed for campaign %s", plan.campaign_id)

    def get_ready_nodes(self, plan: DAGExecutionPlan) -> List[str]:
        ready = []
        for task_id, node in plan.nodes.items():
            if node.status != NodeStatus.PENDING:
                continue
            deps_done = all(
                plan.nodes[dep].status == NodeStatus.COMPLETED
                for dep in node.dependencies
            )
            if deps_done:
                ready.append(task_id)
        return ready

    def mark_completed(self, plan: DAGExecutionPlan, task_id: str, output: dict):
        if task_id not in plan.nodes:
            raise KeyError(f"Task '{task_id}' not found in DAG")
        plan.nodes[task_id].status = NodeStatus.COMPLETED
        plan.nodes[task_id].output = output

    def mark_failed(self, plan: DAGExecutionPlan, task_id: str, error: str):
        if task_id not in plan.nodes:
            raise KeyError(f"Task '{task_id}' not found in DAG")
        plan.nodes[task_id].status = NodeStatus.FAILED
        plan.nodes[task_id].error = error

    def is_complete(self, plan: DAGExecutionPlan) -> bool:
        return all(n.status == NodeStatus.COMPLETED for n in plan.nodes.values())

    def has_failed(self, plan: DAGExecutionPlan) -> bool:
        return any(n.status == NodeStatus.FAILED for n in plan.nodes.values())
