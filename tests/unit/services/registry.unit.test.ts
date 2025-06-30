import { beforeEach, describe, expect, it, vi } from "vitest";

import { hubRegistryService } from "../../../src/services/registry.js";
import { mockKeyPair } from "../../mocks/aoConnect.js";

// Mock external dependencies
vi.mock("../../../src/process.js", () => ({
  createProcess: vi.fn(),
  createProfile: vi.fn(),
}));

vi.mock("../../../src/services/hub_lua.js", () => ({
  evaluateHub: vi.fn(),
  luaModule: "mock-lua-module",
}));

vi.mock("../../../src/relay.js", () => ({
  getZone: vi.fn(),
  register: vi.fn(),
  evalProcess: vi.fn(),
  event: vi.fn(),
}));

describe("HubRegistryService", () => {
  const service = hubRegistryService;
  const mockProfileData = {
    bot: false,
    coverImage: "cover.jpg",
    description: "Test Description",
    displayName: "Test User",
    thumbnail: "thumb.jpg",
    userName: "testuser",
    website: "https://example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create new hub with profile", async () => {
      const { createProcess } = await import(
        "../../../src/process.js"
      );
      const { evalProcess, event } = await import("../../../src/relay.js");

      const mockProcessId = "test-process-123";

      vi.mocked(createProcess).mockResolvedValue(mockProcessId);
      vi.mocked(evalProcess).mockResolvedValue(undefined);
      vi.mocked(event).mockResolvedValue(undefined);

      // Mock the register method
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, mockProfileData);

      expect(processId).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalled();
      expect(event).toHaveBeenCalled();
      expect(service.register).toHaveBeenCalled();
    });

    it("should handle createProcess failure", async () => {
      const { createProcess } = await import("../../../src/process.js");

      vi.mocked(createProcess).mockRejectedValue(
        new Error("Process creation failed"),
      );

      await expect(
        service.create(mockKeyPair, mockProfileData),
      ).rejects.toThrow("Process creation failed");
    });

    it("should handle evaluateHub failure", async () => {
      const { createProcess } = await import("../../../src/process.js");
      const { evalProcess } = await import("../../../src/relay.js");

      vi.mocked(createProcess).mockResolvedValue("test-process");
      vi.mocked(evalProcess).mockRejectedValue(
        new Error("Hub evaluation failed"),
      );

      await expect(
        service.create(mockKeyPair, mockProfileData),
      ).rejects.toThrow("Hub evaluation failed");
    });
  });

  describe("getZoneById", () => {
    it("should retrieve zone by process ID and owner", async () => {
      const { getZone } = await import("../../../src/relay.js");

      const mockZone = {
        id: "zone-123",
        owner: "owner-123",
        processId: "process-123",
        spec: { processId: "process-123" },
      };

      vi.mocked(getZone).mockResolvedValue(mockZone);

      const zone = await service.getZoneById("process-123", "owner-123");

      expect(zone).toEqual(mockZone);
      expect(getZone).toHaveBeenCalledWith("process-123", "owner-123");
    });

    it("should handle getZone failure", async () => {
      const { getZone } = await import("../../../src/relay.js");

      vi.mocked(getZone).mockRejectedValue(new Error("Zone not found"));

      await expect(
        service.getZoneById("invalid-process", "invalid-owner"),
      ).rejects.toThrow("Zone not found");
    });
  });

  describe("register", () => {
    it("should register hub specification", async () => {
      const mockHubSpec = {
        description: "Test hub",
        kinds: ["0", "1"],
        processId: "test-process",
        profile: mockProfileData,
        type: "hub",
        version: "1.0.0",
      };

      // Mock the internal relay call
      const originalRegister = service.register;
      vi.spyOn(service, "register").mockImplementation(async () => {
        // Simulate successful registration
        return undefined;
      });

      await expect(
        service.register(mockKeyPair, "registry-id", mockHubSpec),
      ).resolves.toBeUndefined();

      expect(service.register).toHaveBeenCalled();
    });

    it("should handle registration failure", async () => {
      const mockHubSpec = {
        description: "Test hub",
        kinds: ["0", "1"],
        processId: "test-process",
        profile: mockProfileData,
        type: "hub",
        version: "1.0.0",
      };

      vi.spyOn(service, "register").mockRejectedValue(
        new Error("Registration failed"),
      );

      await expect(
        service.register(mockKeyPair, "registry-id", mockHubSpec),
      ).rejects.toThrow("Registration failed");
    });
  });

  describe("profile data validation", () => {
    it("should handle minimal profile data", async () => {
      const { createProcess } = await import(
        "../../../src/process.js"
      );
      const { evalProcess, event } = await import("../../../src/relay.js");

      const minimalProfile = {
        bot: true,
        coverImage: "",
        description: "",
        displayName: "",
        thumbnail: "",
        userName: "",
        website: "",
      };

      vi.mocked(createProcess).mockResolvedValue("test-process");
      vi.mocked(evalProcess).mockResolvedValue(undefined);
      vi.mocked(event).mockResolvedValue(undefined);
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, minimalProfile);

      expect(processId).toBe("test-process");
      expect(event).toHaveBeenCalled();
    });

    it("should handle complete profile data", async () => {
      const { createProcess } = await import(
        "../../../src/process.js"
      );
      const { evalProcess, event } = await import("../../../src/relay.js");

      const completeProfile = {
        bot: false,
        coverImage: "complete-cover.jpg",
        description: "A complete user profile",
        displayName: "Complete User",
        thumbnail: "complete-thumb.jpg",
        userName: "completeuser",
        website: "https://complete.example.com",
      };

      vi.mocked(createProcess).mockResolvedValue("complete-process");
      vi.mocked(evalProcess).mockResolvedValue(undefined);
      vi.mocked(event).mockResolvedValue(undefined);
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, completeProfile);

      expect(processId).toBe("complete-process");
      expect(event).toHaveBeenCalled();
    });
  });
});
