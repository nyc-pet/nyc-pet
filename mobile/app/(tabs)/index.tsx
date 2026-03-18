import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { PetPost } from "@/lib/types";
import { SafeAreaView } from "react-native-safe-area-context";

const NYC_REGION = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function MapScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");

  const fetchPosts = useCallback(async () => {
    let query = supabase
      .from("pet_posts")
      .select("*")
      .neq("status", "reunited")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query.limit(100);
    setPosts((data ?? []) as PetPost[]);
    setLoading(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchPosts(); }, [fetchPosts]));

  const filtered = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(["all", "lost", "found"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === "all" ? "All" : f === "lost" ? "😢 Lost" : "🤗 Found"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : (
        <MapView style={styles.map} initialRegion={NYC_REGION} showsUserLocation>
          {filtered.map((post) => (
            <Marker
              key={post.id}
              coordinate={{ latitude: post.lat, longitude: post.lng }}
              pinColor={post.status === "lost" ? "#ef4444" : "#22c55e"}
            >
              <Callout onPress={() => router.push(`/pet/${post.id}`)}>
                <View style={styles.callout}>
                  <Text style={[styles.calloutBadge, post.status === "lost" ? styles.badgeLost : styles.badgeFound]}>
                    {post.status === "lost" ? "Lost" : "Found"}
                  </Text>
                  <Text style={styles.calloutTitle}>
                    {post.name ? `${post.name} · ` : ""}{post.species}
                  </Text>
                  <Text style={styles.calloutAddress} numberOfLines={1}>{post.last_seen_address}</Text>
                  <Text style={styles.calloutLink}>Tap to view →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{filtered.length} active {filter === "all" ? "reports" : filter}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  pillActive: { backgroundColor: "#f97316" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  pillTextActive: { color: "#fff" },
  map: { flex: 1 },
  callout: { width: 180, padding: 4 },
  calloutBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
    overflow: "hidden",
  },
  badgeLost: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  badgeFound: { backgroundColor: "#dcfce7", color: "#15803d" },
  calloutTitle: { fontSize: 14, fontWeight: "600", color: "#111", textTransform: "capitalize" },
  calloutAddress: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  calloutLink: { fontSize: 12, color: "#f97316", marginTop: 4, fontWeight: "600" },
  countBadge: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
