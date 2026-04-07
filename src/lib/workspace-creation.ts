export const MAX_WORKSPACE_NAME_LENGTH = 255;
export const MAX_WORKSPACE_SLUG_LENGTH = 63;

const DEFAULT_WORKFLOW_STATE_DEFINITIONS = [
  {
    name: "Triage",
    category: "triage" as const,
    color: "#f59e0b",
  },
  {
    name: "Backlog",
    category: "backlog" as const,
    color: "#6b6f76",
    isDefault: true,
  },
  {
    name: "Todo",
    category: "unstarted" as const,
    color: "#6b6f76",
  },
  {
    name: "In Progress",
    category: "started" as const,
    color: "#f59e0b",
  },
  {
    name: "Done",
    category: "completed" as const,
    color: "#22c55e",
  },
  {
    name: "Canceled",
    category: "canceled" as const,
    color: "#6b6f76",
  },
];

export function sanitizeWorkspaceSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_WORKSPACE_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function validateWorkspaceName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Name is required";
  }

  if (trimmedName.length > MAX_WORKSPACE_NAME_LENGTH) {
    return `Workspace name must be ${MAX_WORKSPACE_NAME_LENGTH} characters or fewer`;
  }

  return null;
}

export function getDefaultWorkflowStates(teamId: string) {
  return DEFAULT_WORKFLOW_STATE_DEFINITIONS.map((state, index) => ({
    ...state,
    teamId,
    position: index,
  }));
}
