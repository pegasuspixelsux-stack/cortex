import { describe, it, expect } from "vitest";
import {
  ROLE_RANK,
  MANAGEABLE_ROLES,
  assignableRoles,
  canManageUsers,
  outranks,
  type UserRole,
} from "./users";

describe("ROLE_RANK", () => {
  it("orders super_admin > admin > manager > agent", () => {
    expect(ROLE_RANK.super_admin).toBeGreaterThan(ROLE_RANK.admin);
    expect(ROLE_RANK.admin).toBeGreaterThan(ROLE_RANK.manager);
    expect(ROLE_RANK.manager).toBeGreaterThan(ROLE_RANK.agent);
  });
});

describe("assignableRoles", () => {
  it("lets admin and super_admin grant manager + agent", () => {
    expect(assignableRoles("admin")).toEqual(["manager", "agent"]);
    expect(assignableRoles("super_admin")).toEqual(["manager", "agent"]);
  });

  it("lets a manager grant agent only", () => {
    expect(assignableRoles("manager")).toEqual(["agent"]);
  });

  it("never lets anyone grant admin or super_admin from the client", () => {
    for (const actor of [null, "agent", "manager", "admin", "super_admin"] as const) {
      const grantable = assignableRoles(actor);
      expect(grantable).not.toContain("admin");
      expect(grantable).not.toContain("super_admin");
    }
  });

  it("gives an agent (or unknown) nothing", () => {
    expect(assignableRoles("agent")).toEqual([]);
    expect(assignableRoles(null)).toEqual([]);
  });
});

describe("canManageUsers", () => {
  it("is true for manager and above, false otherwise", () => {
    expect(canManageUsers("super_admin")).toBe(true);
    expect(canManageUsers("admin")).toBe(true);
    expect(canManageUsers("manager")).toBe(true);
    expect(canManageUsers("agent")).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });
});

describe("outranks", () => {
  it("requires a strictly higher rank", () => {
    expect(outranks("admin", "manager")).toBe(true);
    expect(outranks("manager", "agent")).toBe(true);
    expect(outranks("manager", "manager")).toBe(false);
    expect(outranks("manager", "admin")).toBe(false);
    expect(outranks(null, "agent")).toBe(false);
  });

  it("lets nobody below super_admin outrank a super_admin", () => {
    const others: UserRole[] = ["admin", "manager", "agent"];
    for (const r of others) expect(outranks(r, "super_admin")).toBe(false);
  });
});

describe("MANAGEABLE_ROLES", () => {
  it("excludes super_admin so directory queries never surface one", () => {
    expect(MANAGEABLE_ROLES).not.toContain("super_admin");
    expect(MANAGEABLE_ROLES).toEqual(["admin", "manager", "agent"]);
  });
});
