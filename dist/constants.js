export function AOS_MODULE() {
    return "28gHGe_ARwPfCL7zYD2HB5oGvvP74mbfbHLESNFo55o";
}
export function ARWEAVE_URL() {
    /*
      case "production": {
              return "arweave.net";
          }
      */
    return "arweave.velocity.cloudnet.marshal.ao";
}
export function CU_URL() {
    return "https://cu.velocity.cloudnet.marshal.ao";
}
export function GATEWAY_URL() {
    return "https://gateway.velocity.cloudnet.marshal.ao";
}
export function HUB_REGISTRY_ID() {
    return "g_eSbkmD4LzfZtXaCLmeMcLIBQrqxnY-oFQJJNMIn4w";
}
export function MU_URL() {
    return "https://mu.velocity.cloudnet.marshal.ao";
}
export function SCHEDULER() {
    return "Tm7v2ddwSr_5UxjmuCmhkMSZpzhtKJkkpLMZK_p6mQU";
}
export function toUrl(tx) {
    return "https://" + ARWEAVE_URL() + "/" + tx;
}
export function WAR_TOKEN() {
    return "WPyLgOqELOyN_BoTNdeEMZp5sz3RxDL19IGcs3A9IPc";
}
export const DEFAULT_QUANTITY = "1000000000000000000";
export const DECIMALS = 1000000000000;
export const AR_Token = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10";
export const AO_Token = "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc";
export const BazarUCM = "U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0";
export function formatNumber(num) {
    return num.toLocaleString();
}
