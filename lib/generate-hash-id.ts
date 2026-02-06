import CryptoJS from "crypto-js";

export function generateHashForConversation(memberIds: string[]) {
  const secret = process.env.CONVERSATION_CREATE_SECRET!;
  const joined = memberIds.sort().join("-");
  const hexHash = CryptoJS.HmacSHA256(joined, secret).toString(
    CryptoJS.enc.Hex
  );
  return hexHash;
}
export function generateHashForGroupConversation(memberIds: string[], groupName: string) {
  const secret = process.env.CONVERSATION_CREATE_SECRET!;
  const joined = memberIds.sort().join("-")  + groupName;
  const hexHash = CryptoJS.HmacSHA256(joined, secret).toString(
    CryptoJS.enc.Hex
  );
  return hexHash;
}
