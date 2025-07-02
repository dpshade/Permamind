import { createProcess } from "../process.js";
import { evalProcess } from "../relay.js";
const service = () => {
    return {
        create: async (signer, tokenModule) => {
            const processId = await createProcess(signer);
            await evaluateToken(signer, processId, tokenModule);
            return processId;
        },
    };
};
async function evaluateToken(signer, processId, tokenModule) {
    await evalProcess(signer, tokenModule, processId);
}
export const tokenService = service();
