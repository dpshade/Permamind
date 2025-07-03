import { describe, expect, it } from "vitest";

import { DEFAULT_TOKEN_PROCESS } from "../../../src/templates/defaultTokenProcess.js";
import type { ProcessDefinition } from "../../../src/services/ProcessCommunicationService.js";

describe("DefaultTokenProcess", () => {
  describe("process definition structure", () => {
    it("should have valid process definition structure", () => {
      expect(DEFAULT_TOKEN_PROCESS).toBeDefined();
      expect(DEFAULT_TOKEN_PROCESS.handlers).toBeDefined();
      expect(Array.isArray(DEFAULT_TOKEN_PROCESS.handlers)).toBe(true);
      expect(DEFAULT_TOKEN_PROCESS.handlers.length).toBeGreaterThan(0);
    });

    it("should have all required handler properties", () => {
      DEFAULT_TOKEN_PROCESS.handlers.forEach((handler, index) => {
        expect(handler.action).toBeDefined();
        expect(typeof handler.action).toBe("string");
        expect(handler.description).toBeDefined();
        expect(typeof handler.description).toBe("string");
        expect(handler.examples).toBeDefined();
        expect(Array.isArray(handler.examples)).toBe(true);
        expect(typeof handler.isWrite).toBe("boolean");
        expect(handler.parameters).toBeDefined();
        expect(Array.isArray(handler.parameters)).toBe(true);
      });
    });

    it("should have proper parameter definitions", () => {
      DEFAULT_TOKEN_PROCESS.handlers.forEach((handler) => {
        handler.parameters.forEach((param, paramIndex) => {
          expect(param.name).toBeDefined();
          expect(typeof param.name).toBe("string");
          expect(param.description).toBeDefined();
          expect(typeof param.description).toBe("string");
          expect(typeof param.required).toBe("boolean");
          expect(param.type).toBeDefined();
          expect(typeof param.type).toBe("string");
        });
      });
    });
  });

  describe("token handlers", () => {
    it("should include Transfer handler", () => {
      const transferHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Transfer"
      );
      expect(transferHandler).toBeDefined();
      expect(transferHandler!.isWrite).toBe(true);
      expect(transferHandler!.examples.length).toBeGreaterThan(0);
      
      const recipientParam = transferHandler!.parameters.find(
        (p) => p.name === "recipient"
      );
      expect(recipientParam).toBeDefined();
      expect(recipientParam!.required).toBe(true);
      expect(recipientParam!.type).toBe("string");
      
      const quantityParam = transferHandler!.parameters.find(
        (p) => p.name === "quantity"
      );
      expect(quantityParam).toBeDefined();
      expect(quantityParam!.required).toBe(true);
      expect(quantityParam!.type).toBe("number");
    });

    it("should include Balance handler", () => {
      const balanceHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Balance"
      );
      expect(balanceHandler).toBeDefined();
      expect(balanceHandler!.isWrite).toBe(false);
      expect(balanceHandler!.examples.length).toBeGreaterThan(0);
      
      const targetParam = balanceHandler!.parameters.find(
        (p) => p.name === "target"
      );
      expect(targetParam).toBeDefined();
      expect(targetParam!.required).toBe(false);
      expect(targetParam!.type).toBe("string");
    });

    it("should include Info handler", () => {
      const infoHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Info"
      );
      expect(infoHandler).toBeDefined();
      expect(infoHandler!.isWrite).toBe(false);
      expect(infoHandler!.examples.length).toBeGreaterThan(0);
      expect(infoHandler!.parameters).toHaveLength(0);
    });

    it("should include Balances handler", () => {
      const balancesHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Balances"
      );
      expect(balancesHandler).toBeDefined();
      expect(balancesHandler!.isWrite).toBe(false);
      expect(balancesHandler!.examples.length).toBeGreaterThan(0);
      expect(balancesHandler!.parameters).toHaveLength(0);
    });

    it("should include TotalSupply handler", () => {
      const totalSupplyHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "TotalSupply"
      );
      expect(totalSupplyHandler).toBeDefined();
      expect(totalSupplyHandler!.isWrite).toBe(false);
      expect(totalSupplyHandler!.examples.length).toBeGreaterThan(0);
      expect(totalSupplyHandler!.parameters).toHaveLength(0);
    });
  });

  describe("handler examples", () => {
    it("should have meaningful examples for each handler", () => {
      DEFAULT_TOKEN_PROCESS.handlers.forEach((handler) => {
        expect(handler.examples.length).toBeGreaterThan(0);
        handler.examples.forEach((example) => {
          expect(typeof example).toBe("string");
          expect(example.length).toBeGreaterThan(0);
          expect(example.toLowerCase()).toContain(
            handler.action.toLowerCase()
          );
        });
      });
    });

    it("should have diverse examples for Transfer handler", () => {
      const transferHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Transfer"
      );
      expect(transferHandler!.examples.length).toBeGreaterThanOrEqual(3);
      
      // Check for variety in examples
      const exampleTexts = transferHandler!.examples.join(" ").toLowerCase();
      expect(exampleTexts).toContain("send");
      expect(exampleTexts).toContain("transfer");
      expect(exampleTexts).toContain("tokens");
    });

    it("should have diverse examples for Balance handler", () => {
      const balanceHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Balance"
      );
      expect(balanceHandler!.examples.length).toBeGreaterThanOrEqual(3);
      
      const exampleTexts = balanceHandler!.examples.join(" ").toLowerCase();
      expect(exampleTexts).toContain("balance");
      expect(exampleTexts).toContain("check");
    });
  });

  describe("parameter validation", () => {
    it("should have proper parameter types", () => {
      const validTypes = ["string", "number", "boolean"];
      
      DEFAULT_TOKEN_PROCESS.handlers.forEach((handler) => {
        handler.parameters.forEach((param) => {
          expect(validTypes).toContain(param.type);
        });
      });
    });

    it("should have required parameters marked correctly", () => {
      const transferHandler = DEFAULT_TOKEN_PROCESS.handlers.find(
        (h) => h.action === "Transfer"
      );
      
      const requiredParams = transferHandler!.parameters.filter(
        (p) => p.required
      );
      expect(requiredParams.length).toBeGreaterThan(0);
      
      const optionalParams = transferHandler!.parameters.filter(
        (p) => !p.required
      );
      expect(optionalParams.length).toBeGreaterThanOrEqual(0);
    });

    it("should have descriptive parameter descriptions", () => {
      DEFAULT_TOKEN_PROCESS.handlers.forEach((handler) => {
        handler.parameters.forEach((param) => {
          expect(param.description.length).toBeGreaterThan(10);
          expect(param.description.toLowerCase()).toContain(
            param.required ? "required" : "optional"
          );
        });
      });
    });
  });

  describe("write vs read operations", () => {
    it("should properly categorize write operations", () => {
      const writeHandlers = DEFAULT_TOKEN_PROCESS.handlers.filter(
        (h) => h.isWrite
      );
      
      writeHandlers.forEach((handler) => {
        expect(["Transfer", "Mint", "Burn"]).toContain(handler.action);
      });
    });

    it("should properly categorize read operations", () => {
      const readHandlers = DEFAULT_TOKEN_PROCESS.handlers.filter(
        (h) => !h.isWrite
      );
      
      readHandlers.forEach((handler) => {
        expect(["Balance", "Info", "Balances", "TotalSupply"]).toContain(
          handler.action
        );
      });
    });
  });

  describe("type compatibility", () => {
    it("should conform to ProcessDefinition interface", () => {
      // This is a compile-time check that the constant matches the interface
      const processDefinition: ProcessDefinition = DEFAULT_TOKEN_PROCESS;
      expect(processDefinition).toBeDefined();
      expect(processDefinition.handlers).toBeDefined();
    });

    it("should be serializable to JSON", () => {
      expect(() => JSON.stringify(DEFAULT_TOKEN_PROCESS)).not.toThrow();
      
      const serialized = JSON.stringify(DEFAULT_TOKEN_PROCESS);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.handlers).toBeDefined();
      expect(parsed.handlers.length).toBe(DEFAULT_TOKEN_PROCESS.handlers.length);
    });
  });
});