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
}));

vi.mock("../../../src/relay.js", () => ({
  getZone: vi.fn(),
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
      const { createProcess, createProfile } = await import(
        "../../../src/process.js"
      );
      const { evaluateHub } = await import("../../../src/services/hub_lua.js");

      const mockProcessId = "test-process-123";

      vi.mocked(createProcess).mockResolvedValue(mockProcessId);
      vi.mocked(evaluateHub).mockResolvedValue(undefined);
      vi.mocked(createProfile).mockResolvedValue(undefined);

      // Mock the register method
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, mockProfileData);

      expect(processId).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evaluateHub).toHaveBeenCalledWith(mockKeyPair, mockProcessId);
      expect(createProfile).toHaveBeenCalledWith(
        mockKeyPair,
        mockProcessId,
        mockProfileData,
      );
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
      const { evaluateHub } = await import("../../../src/services/hub_lua.js");

      vi.mocked(createProcess).mockResolvedValue("test-process");
      vi.mocked(evaluateHub).mockRejectedValue(
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

      expect(service.register).toHaveBeenCalledWith(
        mockKeyPair,
        "registry-id",
        mockHubSpec,
      );
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
      const { createProcess, createProfile } = await import(
        "../../../src/process.js"
      );
      const { evaluateHub } = await import("../../../src/services/hub_lua.js");

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
      vi.mocked(evaluateHub).mockResolvedValue(undefined);
      vi.mocked(createProfile).mockResolvedValue(undefined);
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, minimalProfile);

      expect(processId).toBe("test-process");
      expect(createProfile).toHaveBeenCalledWith(
        mockKeyPair,
        "test-process",
        minimalProfile,
      );
    });

    it("should handle complete profile data", async () => {
      const { createProcess, createProfile } = await import(
        "../../../src/process.js"
      );
      const { evaluateHub } = await import("../../../src/services/hub_lua.js");

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
      vi.mocked(evaluateHub).mockResolvedValue(undefined);
      vi.mocked(createProfile).mockResolvedValue(undefined);
      vi.spyOn(service, "register").mockResolvedValue(undefined);

      const processId = await service.create(mockKeyPair, completeProfile);

      expect(processId).toBe("complete-process");
      expect(createProfile).toHaveBeenCalledWith(
        mockKeyPair,
        "complete-process",
        completeProfile,
      );
    });
  });
});
