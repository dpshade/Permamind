import { read, send } from "../process.js";
const WRITE_ACTIONS = new Set([
    "Eval",
    "Event",
    "Register",
    "Relay",
    "SetOwner",
    "SetRelay",
    "Subscribe",
    "Transfer",
    "UnSubscribe",
    "Update-Profile",
]);
const service = () => {
    return {
        executeMessage: async (signer, message) => {
            try {
                if (service().isWriteOperation(message.tags, message.isWrite)) {
                    return await service().sendWriteMessage(signer, message);
                }
                else {
                    return await service().sendReadMessage(message);
                }
            }
            catch (error) {
                return {
                    error: error instanceof Error ? error.message : "Unknown error",
                    success: false,
                };
            }
        },
        isWriteOperation: (tags, isWrite) => {
            // Check handler designation first (most accurate)
            if (isWrite !== undefined) {
                return isWrite;
            }
            // Fall back to action-based detection for backward compatibility
            const actionTag = tags.find((tag) => tag.name === "Action");
            if (!actionTag) {
                return false;
            }
            return WRITE_ACTIONS.has(actionTag.value);
        },
        sendReadMessage: async (message) => {
            try {
                const result = await read(message.processId, message.tags);
                return {
                    data: result,
                    success: true,
                };
            }
            catch (error) {
                return {
                    error: error instanceof Error ? error.message : "Read operation failed",
                    success: false,
                };
            }
        },
        sendWriteMessage: async (signer, message) => {
            try {
                const result = await send(signer, message.processId, message.tags, message.data || null);
                return {
                    data: result,
                    success: true,
                };
            }
            catch (error) {
                return {
                    error: error instanceof Error ? error.message : "Write operation failed",
                    success: false,
                };
            }
        },
    };
};
export const aoMessageService = service();
