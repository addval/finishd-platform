/**
 * Projects Service Tests
 * Unit tests for project state machine and operations
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { canTransition } from "./projects.service.js"

// Mock database
vi.mock("../../db/index.js", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    orderBy: vi.fn().mockReturnThis(),
  },
  projects: {},
  homeownerProfiles: {},
  properties: {},
  activityLogs: {},
}))

describe("Project State Machine", () => {
  describe("canTransition", () => {
    // Draft state transitions
    it("should allow draft → seeking_designer", () => {
      expect(canTransition("draft", "seeking_designer")).toBe(true)
    })

    it("should allow draft → cancelled", () => {
      expect(canTransition("draft", "cancelled")).toBe(true)
    })

    it("should not allow draft → in_progress", () => {
      expect(canTransition("draft", "in_progress")).toBe(false)
    })

    it("should not allow draft → completed", () => {
      expect(canTransition("draft", "completed")).toBe(false)
    })

    // Seeking designer transitions
    it("should allow seeking_designer → in_progress", () => {
      expect(canTransition("seeking_designer", "in_progress")).toBe(true)
    })

    it("should allow seeking_designer → cancelled", () => {
      expect(canTransition("seeking_designer", "cancelled")).toBe(true)
    })

    it("should not allow seeking_designer → draft", () => {
      expect(canTransition("seeking_designer", "draft")).toBe(false)
    })

    it("should not allow seeking_designer → completed", () => {
      expect(canTransition("seeking_designer", "completed")).toBe(false)
    })

    // In progress transitions
    it("should allow in_progress → completed", () => {
      expect(canTransition("in_progress", "completed")).toBe(true)
    })

    it("should allow in_progress → cancelled", () => {
      expect(canTransition("in_progress", "cancelled")).toBe(true)
    })

    it("should not allow in_progress → draft", () => {
      expect(canTransition("in_progress", "draft")).toBe(false)
    })

    it("should not allow in_progress → seeking_designer", () => {
      expect(canTransition("in_progress", "seeking_designer")).toBe(false)
    })

    // Terminal states
    it("should not allow completed → any state", () => {
      expect(canTransition("completed", "draft")).toBe(false)
      expect(canTransition("completed", "seeking_designer")).toBe(false)
      expect(canTransition("completed", "in_progress")).toBe(false)
      expect(canTransition("completed", "cancelled")).toBe(false)
    })

    it("should not allow cancelled → any state", () => {
      expect(canTransition("cancelled", "draft")).toBe(false)
      expect(canTransition("cancelled", "seeking_designer")).toBe(false)
      expect(canTransition("cancelled", "in_progress")).toBe(false)
      expect(canTransition("cancelled", "completed")).toBe(false)
    })

    // Unknown states
    it("should not allow transitions from unknown states", () => {
      expect(canTransition("unknown", "draft")).toBe(false)
    })
  })
})

describe("Project Workflow", () => {
  // These are integration-style tests that would need a test database
  // For now, we test the state machine logic above

  describe("State Transition Rules", () => {
    it("should follow the correct project lifecycle", () => {
      // Valid lifecycle: draft → seeking_designer → in_progress → completed
      expect(canTransition("draft", "seeking_designer")).toBe(true)
      expect(canTransition("seeking_designer", "in_progress")).toBe(true)
      expect(canTransition("in_progress", "completed")).toBe(true)
    })

    it("should allow cancellation at any non-terminal state", () => {
      expect(canTransition("draft", "cancelled")).toBe(true)
      expect(canTransition("seeking_designer", "cancelled")).toBe(true)
      expect(canTransition("in_progress", "cancelled")).toBe(true)
    })

    it("should not allow skipping states", () => {
      // Can't go directly from draft to in_progress
      expect(canTransition("draft", "in_progress")).toBe(false)
      // Can't go directly from draft to completed
      expect(canTransition("draft", "completed")).toBe(false)
      // Can't go directly from seeking_designer to completed
      expect(canTransition("seeking_designer", "completed")).toBe(false)
    })

    it("should not allow going backwards", () => {
      expect(canTransition("seeking_designer", "draft")).toBe(false)
      expect(canTransition("in_progress", "seeking_designer")).toBe(false)
      expect(canTransition("in_progress", "draft")).toBe(false)
      expect(canTransition("completed", "in_progress")).toBe(false)
    })
  })
})
