import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";

const ROOMS = [
  "Inside the glovebox",
  "Underneath the driver's seat",
  "Tucked into the sun visor",
  "Wedged between the cupholders",
  "Inside the sunroof frame",
  "Curled up in the trunk",
  "Behind the spare tire",
  "Hiding in the air vent",
  "Inside the center console tray",
  "On top of the windshield wipers",
  "Riding inside the rearview mirror",
  "Folded inside a road map",
  "Stuffed in a gas station coffee cup",
  "Clinging to the luggage rack",
  "Hiding inside the radio",
  "Curled in the dashboard clock",
  "Stuck to the back of a bumper sticker",
  "Riding shotgun on the turn signal lever",
  "Inside the spare change tray",
  "Crammed into the car manual glovebox",
  "Perched on the side mirror",
  "Taped behind the license plate",
  "Surfing the antenna",
  "Inside a bag of forgotten fries",
  "Hiding in the emergency triangle kit",
];

function pickRoom(exclude) {
  if (ROOMS.length <= 1) return ROOMS[0];
  let next = ROOMS[Math.floor(Math.random() * ROOMS.length)];
  let guard = 0;
  while (next === exclude && guard < 10) {
    next = ROOMS[Math.floor(Math.random() * ROOMS.length)];
    guard++;
  }
  return next;
}

/**
 * Virtual Hide & Seek — the hider picks a secret "room", the seeker asks
 * yes/no questions to narrow it down. The phone hides and later reveals
 * the spot while tracking question count and who's hiding next.
 */
export default function VirtualHideAndSeek({ accent = "#a855f7" }) {
  const [hiderName, setHiderName] = useState("Driver");
  const [seekerName, setSeekerName] = useState("Passenger");
  const [editing, setEditing] = useState(true);

  const [room, setRoom] = useState(null);
  const [concealed, setConcealed] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [phase, setPhase] = useState("setup"); // setup | hiding | seeking | found
  const [history, setHistory] = useState([]);
  const [customRoom, setCustomRoom] = useState("");

  const pick = () => {
    const next = pickRoom(room);
    setRoom(next);
    setConcealed(true);
    setQuestionCount(0);
    setPhase("hiding");
  };

  const useCustom = () => {
    const r = customRoom.trim();
    if (!r) return;
    setRoom(r);
    setCustomRoom("");
    setConcealed(true);
    setQuestionCount(0);
    setPhase("hiding");
  };

  const startSeeking = () => {
    setConcealed(true);
    setPhase("seeking");
  };

  const markFound = () => {
    setPhase("found");
    setConcealed(false);
    setHistory((h) =>
      [
        { id: Date.now(), hider: hiderName, seeker: seekerName, room, questionCount },
        ...h,
      ].slice(0, 10)
    );
  };

  const swapAndReset = () => {
    const prevHider = hiderName;
    setHiderName(seekerName);
    setSeekerName(prevHider);
    setRoom(null);
    setQuestionCount(0);
    setConcealed(true);
    setPhase("setup");
  };

  const playSameAgain = () => {
    setRoom(null);
    setQuestionCount(0);
    setConcealed(true);
    setPhase("setup");
  };

  if (editing) {
    return (
      <ScrollView className="flex-1 pt-6">
        <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Virtual Hide & Seek
        </Text>
        <Text className="text-slate-900 text-xl font-semibold leading-7 mb-4">
          Who's hiding first?
        </Text>
        <Text className="text-slate-500 text-sm mb-4 leading-5">
          The hider picks a secret spot on the phone and keeps it hidden. The
          seeker asks yes/no questions out loud. Tap "Found me" when they
          guess it.
        </Text>
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
          Hider
        </Text>
        <TextInput
          value={hiderName}
          onChangeText={setHiderName}
          placeholder="Driver"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
        />
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
          Seeker
        </Text>
        <TextInput
          value={seekerName}
          onChangeText={setSeekerName}
          placeholder="Passenger"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-6"
        />
        <TouchableOpacity
          onPress={() => {
            setHiderName(hiderName.trim() || "Hider");
            setSeekerName(seekerName.trim() || "Seeker");
            setEditing(false);
          }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-white text-center font-bold text-base">
            Start hiding
          </Text>
        </TouchableOpacity>
        <View className="h-10" />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 pt-4">
      <View className="flex-row mb-4">
        <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 mr-2">
          <Text className="text-slate-500 text-xs uppercase tracking-wider">
            Hiding
          </Text>
          <Text className="text-slate-900 font-bold text-base mt-1">
            {hiderName}
          </Text>
        </View>
        <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <Text className="text-slate-500 text-xs uppercase tracking-wider">
            Seeking
          </Text>
          <Text className="text-slate-900 font-bold text-base mt-1">
            {seekerName}
          </Text>
        </View>
      </View>

      {phase === "setup" && (
        <View>
          <Text className="text-slate-500 text-sm mb-3">
            {hiderName}, pick a hiding spot only you can see.
          </Text>
          <TouchableOpacity
            onPress={pick}
            className="rounded-2xl p-5 mb-3"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white text-center font-bold text-base">
              Surprise me with a room
            </Text>
          </TouchableOpacity>
          <Text className="text-slate-500 text-xs uppercase tracking-wider mt-2 mb-1">
            Or hide somewhere custom
          </Text>
          <TextInput
            value={customRoom}
            onChangeText={setCustomRoom}
            placeholder="Inside the cassette deck…"
            placeholderTextColor="#94a3b8"
            className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-3"
          />
          <TouchableOpacity
            onPress={useCustom}
            disabled={!customRoom.trim()}
            className="rounded-2xl p-4 bg-slate-900"
            style={{ opacity: customRoom.trim() ? 1 : 0.4 }}
          >
            <Text className="text-white text-center font-bold">
              Hide in my spot
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "hiding" && (
        <View>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 items-center">
            <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
              {hiderName}'s secret spot
            </Text>
            {concealed ? (
              <Text className="text-slate-500 italic text-center my-4">
                Hidden. Tap below to peek while the seeker looks away.
              </Text>
            ) : (
              <Text
                className="text-slate-900 text-xl font-black text-center my-2"
                style={{ color: accent }}
              >
                {room}
              </Text>
            )}
            <View className="flex-row mt-2">
              <TouchableOpacity
                onPressIn={() => setConcealed(false)}
                onPressOut={() => setConcealed(true)}
                className="rounded-xl px-5 py-3 bg-slate-900 mr-2"
              >
                <Text className="text-white font-bold">
                  {concealed ? "Hold to peek" : "Let go to hide"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pick} className="rounded-xl px-5 py-3 bg-slate-100">
                <Text className="text-slate-700 font-bold">Re-roll</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={startSeeking}
            className="rounded-2xl p-5"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white text-center font-bold">
              I'm hidden — start the hunt
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "seeking" && (
        <View>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 items-center">
            <Text className="text-xs uppercase tracking-widest text-slate-500">
              Questions asked
            </Text>
            <Text
              className="font-black mt-1"
              style={{ fontSize: 44, color: accent }}
            >
              {questionCount}
            </Text>
            <View className="flex-row mt-3">
              <TouchableOpacity
                onPress={() => setQuestionCount((c) => c + 1)}
                className="rounded-xl px-5 py-3 mr-2"
                style={{ backgroundColor: accent }}
              >
                <Text className="text-white font-bold">+ Question</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setQuestionCount((c) => Math.max(0, c - 1))}
                className="rounded-xl px-5 py-3 bg-slate-100"
              >
                <Text className="text-slate-700 font-bold">-</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 items-center">
            <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
              Secret spot
            </Text>
            {concealed ? (
              <Text className="text-slate-500 italic text-center my-3">
                Still hidden
              </Text>
            ) : (
              <Text
                className="text-slate-900 text-xl font-black text-center my-2"
                style={{ color: accent }}
              >
                {room}
              </Text>
            )}
            <TouchableOpacity
              onPressIn={() => setConcealed(false)}
              onPressOut={() => setConcealed(true)}
              className="rounded-xl px-5 py-3 bg-slate-900"
            >
              <Text className="text-white font-bold">
                {concealed ? "Hold to peek" : "Release"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={markFound}
            className="rounded-2xl p-5"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white text-center font-bold text-base">
              Found me!
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === "found" && (
        <View>
          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
            <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: accent }}>
              Found in {questionCount} question{questionCount === 1 ? "" : "s"}
            </Text>
            <Text className="text-slate-900 text-2xl font-black mb-1">
              {seekerName} cracked it
            </Text>
            <Text className="text-slate-500">
              {hiderName} was hiding at: {room}
            </Text>
          </View>

          <TouchableOpacity
            onPress={swapAndReset}
            className="rounded-2xl p-5 mb-2"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white text-center font-bold">
              Swap roles & hide again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={playSameAgain}
            className="rounded-2xl p-4 bg-slate-100"
          >
            <Text className="text-slate-900 text-center font-bold">
              Same hider, new spot
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {history.length > 0 && (
        <View className="mt-8 mb-12">
          <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Round log
          </Text>
          {history.map((h) => (
            <View
              key={h.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2"
            >
              <Text className="text-slate-900 font-bold">
                {h.seeker} found {h.hider}
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                {h.room} · {h.questionCount} question{h.questionCount === 1 ? "" : "s"}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
