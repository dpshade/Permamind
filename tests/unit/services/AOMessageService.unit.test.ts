import { JWKInterface } from "arweave/node/lib/wallet.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AOMessage,
  AOMessageResponse,
  aoMessageService,
} from "../../../src/services/AOMessageService.js";

// Mock process.ts dependencies
vi.mock("../../../src/process.js", () => ({
  read: vi.fn(),
  send: vi.fn(),
}));

import { read, send } from "../../../src/process.js";

const mockSend = vi.mocked(send);
const mockRead = vi.mocked(read);

describe("AOMessageService", () => {
  const mockSigner: JWKInterface = {
    e: "AQAB",
    kty: "RSA",
    n: "test",
  } as JWKInterface;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("executeMessage", () => {
    it("should route write operations to sendWriteMessage", async () => {
      const writeMessage: AOMessage = {
        data: "test data",
        processId: "test-process",
        tags: [{ name: "Action", value: "Transfer" }],
      };

      mockSend.mockResolvedValueOnce("success");

      const result = await aoMessageService.executeMessage(
        mockSigner,
        writeMessage,
      );

      expect(mockSend).toHaveBeenCalledWith(
        mockSigner,
        "test-process",
        [{ name: "Action", value: "Transfer" }],
        "test data",
      );
      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
    });

    it("should route read operations to sendReadMessage", async () => {
      const readMessage: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Info" }],
      };

      mockRead.mockResolvedValueOnce({ Data: "test result" });

      const result = await aoMessageService.executeMessage(
        mockSigner,
        readMessage,
      );

      expect(mockRead).toHaveBeenCalledWith("test-process", [
        { name: "Action", value: "Info" },
      ]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ Data: "test result" });
    });

    it("should handle errors gracefully", async () => {
      const message: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Transfer" }],
      };

      mockSend.mockRejectedValueOnce(new Error("Network error"));

      const result = await aoMessageService.executeMessage(mockSigner, message);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("isWriteOperation", () => {
    it("should correctly identify write actions", () => {
      const writeTags = [{ name: "Action", value: "Transfer" }];
      expect(aoMessageService.isWriteOperation(writeTags)).toBe(true);

      const writeEventTags = [{ name: "Action", value: "Event" }];
      expect(aoMessageService.isWriteOperation(writeEventTags)).toBe(true);
    });

    it("should correctly identify read actions", () => {
      const readTags = [{ name: "Action", value: "Info" }];
      expect(aoMessageService.isWriteOperation(readTags)).toBe(false);

      const balanceTags = [{ name: "Action", value: "Balance" }];
      expect(aoMessageService.isWriteOperation(balanceTags)).toBe(false);
    });

    it("should return false for missing action tag", () => {
      const noActionTags = [{ name: "Other", value: "Value" }];
      expect(aoMessageService.isWriteOperation(noActionTags)).toBe(false);
    });
  });

  describe("sendWriteMessage", () => {
    it("should send write message with signer", async () => {
      const message: AOMessage = {
        data: "test data",
        processId: "test-process",
        tags: [{ name: "Action", value: "Transfer" }],
      };

      mockSend.mockResolvedValueOnce("write result");

      const result = await aoMessageService.sendWriteMessage(
        mockSigner,
        message,
      );

      expect(mockSend).toHaveBeenCalledWith(
        mockSigner,
        "test-process",
        [{ name: "Action", value: "Transfer" }],
        "test data",
      );
      expect(result.success).toBe(true);
      expect(result.data).toBe("write result");
    });

    it("should handle write errors", async () => {
      const message: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Transfer" }],
      };

      mockSend.mockRejectedValueOnce(new Error("Write failed"));

      const result = await aoMessageService.sendWriteMessage(
        mockSigner,
        message,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Write failed");
    });

    it("should handle null data correctly", async () => {
      const message: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Transfer" }],
      };

      mockSend.mockResolvedValueOnce("success");

      await aoMessageService.sendWriteMessage(mockSigner, message);

      expect(mockSend).toHaveBeenCalledWith(
        mockSigner,
        "test-process",
        [{ name: "Action", value: "Transfer" }],
        null,
      );
    });
  });

  describe("sendReadMessage", () => {
    it("should send read message without signer", async () => {
      const message: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Info" }],
      };

      mockRead.mockResolvedValueOnce({ Data: "read result" });

      const result = await aoMessageService.sendReadMessage(message);

      expect(mockRead).toHaveBeenCalledWith("test-process", [
        { name: "Action", value: "Info" },
      ]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ Data: "read result" });
    });

    it("should handle read errors", async () => {
      const message: AOMessage = {
        processId: "test-process",
        tags: [{ name: "Action", value: "Info" }],
      };

      mockRead.mockRejectedValueOnce(new Error("Read failed"));

      const result = await aoMessageService.sendReadMessage(message);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Read failed");
    });
  });
});
