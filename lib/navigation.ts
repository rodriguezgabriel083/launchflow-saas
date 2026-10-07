export const workspaceViews = ["dashboard", "projects", "tasks", "team", "settings"] as const;
export type WorkspaceView = (typeof workspaceViews)[number];

export function isWorkspaceView(value: string): value is WorkspaceView {
  return workspaceViews.some(view => view === value);
}
