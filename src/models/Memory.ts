export type Memory = {
    id: string,
    content: string,
    role:string, // system or user
    p:string // public key of user
    timestamp: string,
};