import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { getThemeSurfaces } from "../../themes/manifestoThemes";

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
export default function VirtualHideAndSeek({
  accent = "#a855f7",
  surfaces: injected,
}) {
  const surfaces = injected ?? getThemeSurfaces(null);
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
      <ScrollView
        className="flex-1 pt-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text
          className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
        >
          Virtual Hide & Seek
        </Text>
        <Text
          className={`text-xl font-semibold leading-7 mb-4 ${surfaces.titleText}`}
        >
          Who's hiding first?
        </Text>
        <Text className={`text-sm mb-4 leading-5 ${surfaces.mutedText}`}>
          The hider picks a secret spot on the phone and keeps it hidden. The
          seeker asks yes/no questions out loud. Tap "Found me" when they
          guess it.
        </Text>
        <Text
          className={`text-xs uppercase tracking-wider mb-1 ${surfaces.subtleText}`}
        >
          Hider
        </Text>
        <TextInput
          value={hiderName}
          onChangeText={setHiderName}
          placeholder="Driver"
          placeholderTextColor={surfaces.placeholderColor}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          className={`p-4 rounded-xl mb-4 ${surfaces.inputBg}`}
        />
        <Text
          className={`text-xs uppercase tracking-wider mb-1 ${surfaces.subtleText}`}
        >
          Seeker
        </Text>
        <TextInput
          value={seekerName}
          onChangeText={setSeekerName}
          placeholder="Passenger"
          placeholderTextColor={surfaces.placeholderColor}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          className={`p-4 rounded-xl mb-6 ${surfaces.inputBg}`}
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

  const darkBtn = surfaces.isDark ? "bg-white/15" : "bg-slate-900";

  return (
    <ScrollView className="flex-1 pt-4">
      <View className="flex-row mb-4">
        <View className={`flex-1 rounded-2xl p-4 mr-2 ${surfaces.cardBg}`}>
          <Text
            className={`text-xs uppercase tracking-wider ${surfaces.subtleText}`}
          >
            Hiding
          </Text>
          <Text
            className={`font-bold text-base mt-1 ${surfaces.titleText}`}
          >
            {hiderName}
          </Text>
        </View>
        <View className={`flex-1 rounded-2xl p-4 ${surfaces.cardBg}`}>
          <Text
            className={`text-xs uppercase tracking-wider ${surfaces.subtleText}`}
          >
            Seeking
          </Text>
          <Text
            className={`font-bold text-base mt-1 ${surfaces.titleText}`}
          >
            {seekerName}
          </Text>
        </View>
      </View>

      {phase === "setup" && (
        <View>
          <Text className={`text-sm mb-3 ${surfaces.mutedText}`}>
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
          <Text
            className={`text-xs uppercase tracking-wider mt-2 mb-1 ${surfaces.subtleText}`}
          >
            Or hide somewhere custom
          </Text>
          <TextInput
            value={customRoom}
            onChangeText={setCustomRoom}
            placeholder="Inside the cassette deck…"
            placeholderTextColor={surfaces.placeholderColor}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={useCustom}
            className={`p-4 rounded-xl mb-3 ${surfaces.inputBg}`}
          />
          <TouchableOpacity
            onPress={useCustom}
            disabled={!customRoom.trim()}
            className={`rounded-2xl p-4 ${darkBtn}`}
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
          <View
            className={`rounded-2xl p-5 mb-4 items-center ${surfaces.cardBg}`}
          >
            <Text
              className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
            >
              {hiderName}'s secret spot
            </Text>
            {concealed ? (
              <Text
                className={`italic text-center my-4 ${surfaces.mutedText}`}
              >
                Hidden. Tap below to peek while the seeker looks away.
              </Text>
            ) : (
              <Text
                className="text-xl font-black text-center my-2"
                style={{ color: accent }}
              >
                {room}
              </Text>
            )}
            <View className="flex-row mt-2">
              <TouchableOpacity
                onPressIn={() => setConcealed(false)}
                onPressOut={() => setConcealed(true)}
                className={`rounded-xl px-5 py-3 mr-2 ${darkBtn}`}
              >
                <Text className="text-white font-bold">
                  {concealed ? "Hold to peek" : "Let go to hide"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pick}
                className={`rounded-xl px-5 py-3 ${surfaces.secondaryBtnBg}`}
              >
                <Text
                  className={`font-bold ${surfaces.secondaryBtnText}`}
                >
                  Re-roll
                </Text>
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
          <View
            className={`rounded-2xl p-5 mb-4 items-center ${surfaces.cardBg}`}
          >
            <Text
              className={`text-xs uppercase tracking-widest ${surfaces.subtleText}`}
            >
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
                className={`rounded-xl px-5 py-3 ${surfaces.secondaryBtnBg}`}
              >
                <Text className={`font-bold ${surfaces.secondaryBtnText}`}>
                  -
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            className={`rounded-2xl p-5 mb-4 items-center ${surfaces.cardBg}`}
          >
            <Text
              className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
            >
              Secret spot
            </Text>
            {concealed ? (
              <Text
                className={`italic text-center my-3 ${surfaces.mutedText}`}
              >
                Still hidden
              </Text>
            ) : (
              <Text
                className="text-xl font-black text-center my-2"
                style={{ color: accent }}
              >
                {room}
              </Text>
            )}
            <TouchableOpacity
              onPressIn={() => setConcealed(false)}
              onPressOut={() => setConcealed(true)}
              className={`rounded-xl px-5 py-3 ${darkBtn}`}
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
          <View className={`rounded-2xl p-5 mb-4 ${surfaces.cardBg}`}>
            <Text
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: accent }}
            >
              Found in {questionCount} question{questionCount === 1 ? "" : "s"}
            </Text>
            <Text
              className={`text-2xl font-black mb-1 ${surfaces.titleText}`}
            >
              {seekerName} cracked it
            </Text>
            <Text className={surfaces.mutedText}>
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
            className={`rounded-2xl p-4 ${surfaces.secondaryBtnBg}`}
          >
            <Text
              className={`text-center font-bold ${surfaces.secondaryBtnText}`}
            >
              Same hider, new spot
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {history.length > 0 && (
        <View className="mt-8 mb-12">
          <Text
            className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
          >
            Round log
          </Text>
          {history.map((h) => (
            <View
              key={h.id}
              className={`rounded-xl p-3 mb-2 ${surfaces.cardBg}`}
            >
              <Text className={`font-bold ${surfaces.titleText}`}>
                {h.seeker} found {h.hider}
              </Text>
              <Text className={`text-xs mt-0.5 ${surfaces.mutedText}`}>
                {h.room} · {h.questionCount} question
                {h.questionCount === 1 ? "" : "s"}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
