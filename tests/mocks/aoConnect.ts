import { vi } from "vitest";

// Mock AO Connect functions for testing
export const mockSend = vi.fn();
export const mockRead = vi.fn();
export const mockCreateProcess = vi.fn();
export const mockFetchEvents = vi.fn();
export const mockEvent = vi.fn();

// Mock successful responses
mockSend.mockResolvedValue({ messageId: "test_message_123" });
mockRead.mockResolvedValue({
  Data: JSON.stringify([
    {
      Id: "test_event_123",
      Content: "Test content",
      Timestamp: "2024-01-01T00:00:00.000Z",
    },
  ]),
});
mockCreateProcess.mockResolvedValue("test_process_123");
mockFetchEvents.mockResolvedValue([
  {
    Id: "test_event_123",
    Content: "Test content",
    Timestamp: "2024-01-01T00:00:00.000Z",
    p: "test_user_key",
  },
]);
mockEvent.mockResolvedValue({ success: true });

// Mock JWK interface
export const mockKeyPair = {
  kty: "RSA",
  n: "test_n_value",
  e: "AQAB",
  d: "test_d_value",
};

// Mock hub ID and public key
export const mockHubId = "test_hub_123";
export const mockPublicKey = "test_public_key_123";
