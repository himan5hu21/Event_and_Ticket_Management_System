import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const nano = customAlphabet(alphabet, 12);

export const generateTicketCode = () => nano();
