import type { ColorType, Room } from "~/types";

type RoomRef = Ref<Room | undefined> | ComputedRef<Room | undefined>;

export function useRoomColorIcon(roomRef: RoomRef) {
  const room = computed(() => roomRef.value);

  const statusColorMap = ref<Record<Room["status"], ColorType>>({
    "vacant": "success",
    "partially occupied": "info",
    "fully occupied": "error",
    "under maintenance": "warning",
    "reserved": "neutral",
  });

  const featureIcons = computed(() => {
    if (!room.value || !room.value.features)
      return [];

    const featuresArray = Array.isArray(room.value.features)
      ? room.value.features
      : String(room.value.features).split(",").map(f => f.trim()).filter(f => f);

    const iconMap: Record<string, string> = {
      "wifi": "i-lucide-wifi",
      "wardrobe": "i-mdi-wardrobe-outline",
      "cupboard": "i-mdi-wardrobe-outline",
      "desk": "i-material-symbols-desk-rounded",
      "table": "i-material-symbols-desk-rounded",
      "fridge": "i-mdi-fridge-outline",
      "ac": "i-lucide-air-vent",
      "air conditioner": "i-lucide-air-vent",
      "air-conditioning": "i-lucide-air-vent",
      "air condition": "i-lucide-air-vent",
      "balcony": "i-material-symbols-balcony-rounded",
      "patio": "i-material-symbols-balcony-rounded",
      "porch": "i-material-symbols-balcony-rounded",
      "bathroom": "i-lucide-shower-head",
      "washroom": "i-lucide-shower-head",
      "toilet": "i-lucide-shower-head",
      "shower": "i-lucide-shower-head",
    };
    return featuresArray.map((feature) => {
      const lowerFeature = feature.toLowerCase();
      const icon = Object.keys(iconMap).find(key => lowerFeature.includes(key))
        ? iconMap[Object.keys(iconMap).find(key => lowerFeature.includes(key))!]
        : "i-lucide-check";
      return { name: feature, icon };
    });
  });

  return { statusColorMap: statusColorMap.value, featureIcons };
}
