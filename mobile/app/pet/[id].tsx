import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Linking, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, Circle } from "react-native-maps";
import { supabase } from "@/lib/supabase";
import type { PetPost } from "@/lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾",
};

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PetPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    supabase.from("pet_posts").select("*").eq("id", id).single().then(({ data }) => {
      setPost(data as PetPost);
      setLoading(false);
    });
  }, [id]);

  async function markReunited() {
    Alert.alert("Mark as Reunited?", "This will update the post to show the pet has been found.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Reunited! 🎉",
        onPress: async () => {
          setMarking(true);
          await supabase.from("pet_posts").update({ status: "reunited" }).eq("id", id);
          setPost((prev) => prev ? { ...prev, status: "reunited" } : prev);
          setMarking(false);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
  const date = new Date(post.last_seen_date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {post.photo_url ? (
            <Image source={{ uri: post.photo_url }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoEmoji}>{emoji}</Text>
            </View>
          )}
          <View style={[styles.badge, post.status === "lost" ? styles.badgeLost : post.status === "found" ? styles.badgeFound : styles.badgeReunited]}>
            <Text style={styles.badgeText}>
              {post.status === "lost" ? "Lost" : post.status === "found" ? "Found" : "Reunited 🎉"}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title */}
          <Text style={styles.title}>
            {post.name ?? (post.species.charAt(0).toUpperCase() + post.species.slice(1))}
          </Text>
          {post.breed && <Text style={styles.breed}>{post.breed}</Text>}

          {/* Info grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Animal</Text>
              <Text style={styles.gridValue}>{post.species}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Color</Text>
              <Text style={styles.gridValue}>{post.color}</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="calendar-outline" size={14} color="#f97316" />
              <Text style={styles.gridLabel}>Date</Text>
              <Text style={styles.gridValue} numberOfLines={2}>{date}</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="location-outline" size={14} color="#f97316" />
              <Text style={styles.gridLabel}>Borough</Text>
              <Text style={styles.gridValue}>{post.borough}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{post.description}</Text>

          {/* Address */}
          <Text style={styles.sectionTitle}>Last Seen At</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#9ca3af" />
            <Text style={styles.address}>{post.last_seen_address}</Text>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: post.lat, longitude: post.lng,
                latitudeDelta: 0.01, longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: post.lat, longitude: post.lng }}
                pinColor={post.status === "lost" ? "#ef4444" : "#22c55e"}
              />
              <Circle
                center={{ latitude: post.lat, longitude: post.lng }}
                radius={200}
                strokeColor={post.status === "lost" ? "#ef4444" : "#22c55e"}
                fillColor={post.status === "lost" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)"}
              />
            </MapView>
          </View>

          {/* Contact */}
          {post.status !== "reunited" && (
            <View style={styles.contactBox}>
              <Text style={styles.contactTitle}>Contact</Text>
              <View style={styles.contactItem}>
                <Ionicons name="person-outline" size={16} color="#f97316" />
                <Text style={styles.contactText}>{post.contact_name}</Text>
              </View>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${post.contact_email}`)}
              >
                <Ionicons name="mail-outline" size={16} color="#f97316" />
                <Text style={[styles.contactText, styles.contactLink]}>{post.contact_email}</Text>
              </TouchableOpacity>
              {post.contact_phone && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`tel:${post.contact_phone}`)}
                >
                  <Ionicons name="call-outline" size={16} color="#f97316" />
                  <Text style={[styles.contactText, styles.contactLink]}>{post.contact_phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Mark Reunited */}
          {post.status !== "reunited" && (
            <TouchableOpacity
              style={styles.reunitedBtn}
              onPress={markReunited}
              disabled={marking}
            >
              {marking ? <ActivityIndicator color="#f97316" /> : <Text style={styles.reunitedBtnText}>Mark as Reunited 🎉</Text>}
            </TouchableOpacity>
          )}

          {post.status === "reunited" && (
            <View style={styles.reunitedBox}>
              <Text style={styles.reunitedEmoji}>🎉</Text>
              <Text style={styles.reunitedText}>This pet has been reunited with their family!</Text>
            </View>
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  photoContainer: { position: "relative" },
  photo: { width: "100%", height: 280 },
  photoPlaceholder: { backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  photoEmoji: { fontSize: 80 },
  badge: {
    position: "absolute", top: 16, left: 16,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  badgeLost: { backgroundColor: "#fee2e2" },
  badgeFound: { backgroundColor: "#dcfce7" },
  badgeReunited: { backgroundColor: "#dbeafe" },
  badgeText: { fontSize: 13, fontWeight: "700" },
  body: { padding: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", textTransform: "capitalize" },
  breed: { fontSize: 15, color: "#9ca3af", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  gridItem: {
    flex: 1, minWidth: "45%", backgroundColor: "#f9fafb",
    borderRadius: 12, padding: 12,
  },
  gridLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  gridValue: { fontSize: 14, fontWeight: "600", color: "#111827", textTransform: "capitalize" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginTop: 20, marginBottom: 6 },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 22 },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  address: { fontSize: 14, color: "#4b5563", flex: 1 },
  mapContainer: { height: 180, borderRadius: 14, overflow: "hidden", marginTop: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  map: { flex: 1 },
  contactBox: {
    backgroundColor: "#fff7ed", borderRadius: 14, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: "#fed7aa",
  },
  contactTitle: { fontSize: 14, fontWeight: "700", color: "#92400e", marginBottom: 10 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  contactText: { fontSize: 14, color: "#374151" },
  contactLink: { color: "#f97316", textDecorationLine: "underline" },
  reunitedBtn: {
    marginTop: 16, borderWidth: 1.5, borderColor: "#e5e7eb",
    borderRadius: 14, paddingVertical: 14, alignItems: "center",
  },
  reunitedBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  reunitedBox: { marginTop: 20, alignItems: "center", padding: 20 },
  reunitedEmoji: { fontSize: 48, marginBottom: 8 },
  reunitedText: { fontSize: 15, fontWeight: "600", color: "#1d4ed8", textAlign: "center" },
});
