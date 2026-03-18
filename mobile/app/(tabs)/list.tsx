import { useCallback, useState } from "react";
import {
  FlatList, View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { PetPost } from "@/lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾",
};

function PetCard({ post, onPress }: { post: PetPost; onPress: () => void }) {
  const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
  const date = new Date(post.last_seen_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.photoContainer}>
        {post.photo_url ? (
          <Image source={{ uri: post.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        )}
        <View style={[styles.badge, post.status === "lost" ? styles.badgeLost : post.status === "found" ? styles.badgeFound : styles.badgeReunited]}>
          <Text style={styles.badgeText}>
            {post.status === "lost" ? "Lost" : post.status === "found" ? "Found" : "Reunited 🎉"}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {post.name ? `${post.name} · ` : ""}{post.species.charAt(0).toUpperCase() + post.species.slice(1)}
          {post.breed ? ` (${post.breed})` : ""}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color="#9ca3af" />
            <Text style={styles.metaText}>{post.borough}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ListScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");

  const fetchPosts = useCallback(async () => {
    let query = supabase
      .from("pet_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query.limit(50);
    setPosts((data ?? []) as PetPost[]);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchPosts(); }, [fetchPosts]));

  const onRefresh = () => { setRefreshing(true); fetchPosts(); };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to report a lost or found pet.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PetCard post={item} onPress={() => router.push(`/pet/${item.id}`)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: "#f3f4f6" },
  pillActive: { backgroundColor: "#f97316" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  pillTextActive: { color: "#fff" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  photoContainer: { position: "relative" },
  photo: { width: "100%", height: 180 },
  photoPlaceholder: {
    width: "100%", height: 180,
    backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 60 },
  badge: {
    position: "absolute", top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999,
  },
  badgeLost: { backgroundColor: "#fee2e2" },
  badgeFound: { backgroundColor: "#dcfce7" },
  badgeReunited: { backgroundColor: "#dbeafe" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#111" },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4, textTransform: "capitalize" },
  cardDesc: { fontSize: 13, color: "#6b7280", lineHeight: 18, marginBottom: 10 },
  cardMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 12, color: "#9ca3af" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
});
