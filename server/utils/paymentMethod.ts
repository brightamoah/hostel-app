export function mapPaystackChannel(channel: string): "card" | "mobile money" | "bank transfer" | "cash" {
  const channelMap: Record<string, "card" | "mobile money" | "bank transfer" | "cash"> = {
    card: "card",
    mobile_money: "mobile money",
    bank: "bank transfer",
    ussd: "bank transfer",
    bank_transfer: "bank transfer",
  };

  return channelMap[channel.toLowerCase()] || "card";
}
