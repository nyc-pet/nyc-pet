import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, Alert, ActivityIndicator, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import { supabase } from "@/lib/supabase";
import type { PetSpecies, PetStatus } from "@/lib/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const SPECIES: { value: PetSpecies; emoji: string; label: string }[] = [
  { value: "dog", emoji: "🐕", label: "Dog" },
  { value: "cat", emoji: "🐈", label: "Cat" },
  { value: "bird", emoji: "🐦", label: "Bird" },
  { value: "rabbit", emoji: "🐇", label: "Rabbit" },
  { value: "other", emoji: "🐾", label: "Other" },
];

const NYC_REGION = {
  latitude: 40.7128, longitude: -74.006,
  latitudeDelta: 0.15, longitudeDelta: 0.15,
};

export default function ReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PetStatus>("lost");
  const [species, setSpecies] = useState<PetSpecies>("dog");
  const [borough, setBorough] = useState("Manhattan");
  const [mapPin, setMapPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", breed: "", color: "", description: "",
    last_seen_date: new Date().toISOString().split("T")[0],
    last_seen_address: "",
    contact_name: "", contact_email: "", contact_phone: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!mapPin) {
      Alert.alert("Missing location", "Please tap the map to mark where the pet was last seen.");
      return;
    }
    if (!form.color || !form.description || !form.last_seen_address || !form.contact_name || !form.contact_email) {
      Alert.alert("Missing fields", "Please fill out all required fields.");
      return;
    }
    setLoading(true);

    let photo_url: string | null = null;
    if (photoUri) {
      const ext = photoUri.split(".").pop() ?? "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(fileName, blob, { contentType: `image/${ext}` });
      if (!uploadError) {
        const { data } = supabase.storage.from("pet-photos").getPublicUrl(fileName);
        photo_url = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("pet_posts")
      .insert({
        status, species, borough,
        lat: mapPin.latitude,
        lng: mapPin.longitude,
        photo_url,
        name: form.name || null,
        breed: form.breed || null,
        contact_phone: form.contact_phone || null,
        color: form.color,
        description: form.description,
        last_seen_date: form.last_seen_date,
        last_seen_address: form.last_seen_address,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    Alert.alert("Posted!", "Your report is now live.", [
      { text: "View Post", onPress: () => router.push(`/pet/${data.id}`) },
      { text: "Done", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Lost / Found toggle */}
        <View style={styles.row}>
          {(["lost", "found"] as PetStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, status === s && (s === "lost" ? styles.statusBtnLost : styles.statusBtnFound)]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>
                {s === "lost" ? "😢 I Lost My Pet" : "🤗 I Found a Pet"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Species */}
        <Text style={styles.label}>Animal Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesRow}>
          {SPECIES.map((sp) => (
            <TouchableOpacity
              key={sp.value}
              style={[styles.speciesPill, species === sp.value && styles.speciesPillActive]}
              onPress={() => setSpecies(sp.value)}
            >
              <Text style={styles.speciesEmoji}>{sp.emoji}</Text>
              <Text style={[styles.speciesLabel, species === sp.value && styles.speciesLabelActive]}>{sp.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Name & Breed */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Pet Name <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput style={styles.input} placeholder="e.g. Bella" value={form.name} onChangeText={(v) => update("name", v)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Breed <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput style={styles.input} placeholder="e.g. Labrador" value={form.breed} onChangeText={(v) => update("breed", v)} />
          </View>
        </View>

        {/* Color */}
        <Text style={styles.label}>Color / Markings *</Text>
        <TextInput style={styles.input} placeholder="e.g. Brown with white chest" value={form.color} onChangeText={(v) => update("color", v)} />

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Distinguishing features, collar, tags, behavior..."
          value={form.description}
          onChangeText={(v) => update("description", v)}
          multiline numberOfLines={3}
        />

        {/* Date */}
        <Text style={styles.label}>Date Last Seen *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={form.last_seen_date}
          onChangeText={(v) => update("last_seen_date", v)}
        />

        {/* Borough */}
        <Text style={styles.label}>Borough *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesRow}>
          {BOROUGHS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.speciesPill, borough === b && styles.speciesPillActive]}
              onPress={() => setBorough(b)}
            >
              <Text style={[styles.speciesLabel, borough === b && styles.speciesLabelActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Address */}
        <Text style={styles.label}>Last Seen Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Prospect Park, Brooklyn"
          value={form.last_seen_address}
          onChangeText={(v) => update("last_seen_address", v)}
        />

        {/* Map */}
        <Text style={styles.label}>
          <Ionicons name="location" size={14} color="#f97316" /> Pin Location * <Text style={styles.optional}>(tap to place)</Text>
        </Text>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={NYC_REGION}
            onPress={(e) => setMapPin(e.nativeEvent.coordinate)}
          >
            {mapPin && <Marker coordinate={mapPin} pinColor="#f97316" />}
          </MapView>
        </View>
        {mapPin && (
          <Text style={styles.pinConfirm}>✓ Location set</Text>
        )}

        {/* Photo */}
        <Text style={styles.label}>Photo <Text style={styles.optional}>(optional but helpful)</Text></Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoBtnInner}>
              <Ionicons name="camera-outline" size={28} color="#9ca3af" />
              <Text style={styles.photoBtnText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Contact */}
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Your Contact Info</Text>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} placeholder="Your name" value={form.contact_name} onChangeText={(v) => update("contact_name", v)} />
          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} placeholder="you@email.com" value={form.contact_email} onChangeText={(v) => update("contact_email", v)} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Phone <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput style={styles.input} placeholder="(212) 555-0000" value={form.contact_phone} onChangeText={(v) => update("contact_phone", v)} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Report</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { padding: 16, gap: 4 },
  row: { flexDirection: "row", gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 14, marginBottom: 6 },
  optional: { fontWeight: "400", color: "#9ca3af" },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#111827",
  },
  textarea: { height: 80, textAlignVertical: "top" },
  statusBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 2, borderColor: "#e5e7eb",
    alignItems: "center", backgroundColor: "#fff",
  },
  statusBtnLost: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  statusBtnFound: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  statusBtnText: { fontSize: 14, fontWeight: "600", color: "#9ca3af" },
  statusBtnTextActive: { color: "#111827" },
  speciesRow: { marginBottom: 4 },
  speciesPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: "#e5e7eb",
    backgroundColor: "#fff", marginRight: 8,
  },
  speciesPillActive: { borderColor: "#f97316", backgroundColor: "#fff7ed" },
  speciesEmoji: { fontSize: 16 },
  speciesLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  speciesLabelActive: { color: "#f97316" },
  mapContainer: { borderRadius: 14, overflow: "hidden", height: 200, borderWidth: 1, borderColor: "#e5e7eb" },
  map: { flex: 1 },
  pinConfirm: { fontSize: 12, color: "#16a34a", marginTop: 4, fontWeight: "600" },
  photoBtn: {
    height: 140, borderRadius: 14, borderWidth: 2,
    borderColor: "#e5e7eb", borderStyle: "dashed",
    overflow: "hidden", backgroundColor: "#fff",
  },
  photoBtnInner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  photoBtnText: { fontSize: 14, color: "#9ca3af" },
  photoPreview: { width: "100%", height: "100%" },
  contactBox: {
    backgroundColor: "#fff7ed", borderRadius: 14,
    padding: 14, marginTop: 14,
    borderWidth: 1, borderColor: "#fed7aa",
  },
  contactTitle: { fontSize: 14, fontWeight: "700", color: "#92400e", marginBottom: 4 },
  submitBtn: {
    backgroundColor: "#f97316", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 20,
  },
  submitBtnDisabled: { backgroundColor: "#fdba74" },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
