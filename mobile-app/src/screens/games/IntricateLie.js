import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

const PROMPTS = [
  "Tell three stories about yourself — two true, one lie. Guess the lie.",
  "State a wild fact about the last city you drove through. Bluff or truth?",
  "Claim a celebrity you've met. Is it real?",
  "Describe a scar and how you got it. Truth, or creative fiction?",
  "Name a food you secretly love. Believable… or a lie?",
  "Describe the strangest dream you had this week. Guess if it happened.",
  "Share a childhood crush's name. Are you making it up?",
  "Say a skill you claim to have. Can you actually do it?",
  "Tell the story behind the last text you sent. True or bluff?",
  "Describe a hotel room that haunts your memory. Real one, or fiction?",
  "Name a book you claim to have finished. Truth or bluff?",
  "Describe an injury from a pet. Did it happen?",
];

/**
 * The Intricate Lie — a scorekeeping companion for a vocal bluff game.
 *
 * One player tells a story or claim; the other guesses whether it's the
 * truth or a lie. The passenger (or whoever's holding the phone) keeps
 * score with quick-tap buttons.
 */
export default function IntricateLie({ accent = "#a855f7" }) {
  const [p1Name, setP1Name] = useState("Driver");
  const [p2Name, setP2Name] = useState("Passenger");
  const [editing, setEditing] = useState(true);
  const [scores, setScores] = useState([0, 0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [tellerIdx, setTellerIdx] = useState(0);
  const [history, setHistory] = useState([]);

  const names = [p1Name, p2Name];
  const guesserIdx = tellerIdx === 0 ? 1 : 0;

  const award = (idx, label) => {
    setScores((prev) => {
      const next = [...prev];
      next[idx] = prev[idx] + 1;
      return next;
    });
    setHistory((h) =>
      [{ name: names[idx], label, id: Date.now() }, ...h].slice(0, 10)
    );
  };

  const nextRound = () => {
    setPromptIdx((i) => (i + 1) % PROMPTS.length);
    setTellerIdx((t) => (t === 0 ? 1 : 0));
  };

  const resetScores = () => {
    setScores([0, 0]);
    setHistory([]);
  };

  const prompt = useMemo(() => PROMPTS[promptIdx], [promptIdx]);

  if (editing) {
    return (
      <ScrollView className="flex-1 pt-6">
        <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          The Intricate Lie
        </Text>
        <Text className="text-slate-900 text-xl font-semibold leading-7 mb-4">
          Who's bluffing today?
        </Text>
        <Text className="text-slate-500 text-sm mb-4 leading-5">
          One player tells a story; the other guesses if it's true or a lie.
          Tap the name of whoever wins each exchange to keep score.
        </Text>
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
          Player 1
        </Text>
        <TextInput
          value={p1Name}
          onChangeText={setP1Name}
          placeholder="Driver"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
        />
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
          Player 2
        </Text>
        <TextInput
          value={p2Name}
          onChangeText={setP2Name}
          placeholder="Passenger"
          placeholderTextColor="#94a3b8"
          className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-6"
        />
        <TouchableOpacity
          onPress={() => {
            setP1Name(p1Name.trim() || "Player 1");
            setP2Name(p2Name.trim() || "Player 2");
            setEditing(false);
          }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-white text-center font-bold text-base">
            Start bluffing
          </Text>
        </TouchableOpacity>
        <View className="h-10" />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 pt-4">
      <View className="flex-row mb-4">
        {[0, 1].map((i) => (
          <View
            key={i}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 mx-1"
          >
            <Text className="text-slate-500 text-xs uppercase tracking-wider">
              {names[i]}
            </Text>
            <Text
              className="font-black mt-1"
              style={{ fontSize: 32, color: accent }}
            >
              {scores[i]}
            </Text>
          </View>
        ))}
      </View>

      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
        <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Storyteller · {names[tellerIdx]}
        </Text>
        <Text className="text-slate-900 text-lg font-semibold leading-7">
          {prompt}
        </Text>
        <Text className="text-slate-500 text-xs mt-3">
          {names[guesserIdx]} has to call it: truth or lie?
        </Text>
      </View>

      <Text className="text-slate-700 font-semibold mb-2">
        Who won that exchange?
      </Text>
      <View className="flex-row mb-2">
        <TouchableOpacity
          onPress={() => award(guesserIdx, "caught the lie")}
          className="flex-1 rounded-2xl p-4 mr-2"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-white text-center font-bold">
            {names[guesserIdx]} caught it
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => award(tellerIdx, "pulled off the bluff")}
          className="flex-1 rounded-2xl p-4 bg-slate-900"
        >
          <Text className="text-white text-center font-bold">
            {names[tellerIdx]} fooled them
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={nextRound}
        className="rounded-2xl p-4 mt-3 bg-slate-100"
      >
        <Text className="text-slate-900 text-center font-bold">
          Next prompt · swap teller
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resetScores}
        className="rounded-2xl p-3 mt-2 mb-6"
      >
        <Text className="text-slate-500 text-center font-semibold">
          Reset scoreboard
        </Text>
      </TouchableOpacity>

      {history.length > 0 && (
        <View className="mb-8">
          <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Recent
          </Text>
          {history.map((h) => (
            <View
              key={h.id}
              className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2"
            >
              <Text className="text-slate-900 font-bold">{h.name}</Text>
              <Text className="text-slate-500 ml-2">{h.label}</Text>
            </View>
          ))}
        </View>
      )}
      <View className="h-12" />
    </ScrollView>
  );
}
