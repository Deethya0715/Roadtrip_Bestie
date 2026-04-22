import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import Ghost from "./games/Ghost";
import IntricateLie from "./games/IntricateLie";
import VirtualHideAndSeek from "./games/VirtualHideAndSeek";
import LicensePlateMap from "./games/LicensePlateMap";

const WOULD_YOU_RATHER = [
  "Would you rather pull over for the best diner of your life, or push through to arrive 3 hours early?",
  "Would you rather control the playlist all trip, or pick every snack stop?",
  "Would you rather drive through the mountains at sunrise, or along the coast at sunset?",
  "Would you rather never need gas, or never need sleep on road trips?",
  "Would you rather only take scenic routes forever, or only interstates forever?",
  "Would you rather have unlimited free tolls, or unlimited free coffee?",
  "Would you rather road-trip with your favorite band, or your favorite author?",
  "Would you rather have no phone signal the whole trip, or no AC the whole trip?",
  "Would you rather sing every song at the top of your lungs, or never speak for 4 hours?",
  "Would you rather camp under the stars tonight, or splurge on a fancy hotel?",
];

const TRIVIA = [
  {
    q: "What's the longest interstate highway in the US?",
    a: "I-90 (Seattle to Boston, ~3,020 miles)",
  },
  {
    q: "Which state has the most national parks?",
    a: "California (9 national parks)",
  },
  {
    q: "What's the official state fossil of the U.S. Route 66 spirit… I mean, what year did Route 66 open?",
    a: "1926",
  },
  {
    q: "Which country invented the drive-thru?",
    a: "United States (Red's Giant Hamburg, 1947)",
  },
  {
    q: "What's the most common car color globally?",
    a: "White",
  },
  {
    q: "What bridge spans the Golden Gate strait?",
    a: "The Golden Gate Bridge (opened 1937)",
  },
  {
    q: "How many US states touch the Mississippi River?",
    a: "10",
  },
  {
    q: "What city is called the 'Motor City'?",
    a: "Detroit, Michigan",
  },
];

const ISPY_PROMPTS = [
  "something red",
  "a license plate from another state",
  "a billboard for food",
  "an animal",
  "a truck with more than 6 wheels",
  "a flag",
  "a body of water",
  "something shaped like a star",
  "a bridge",
  "a place you'd want to stop",
];

const TRUTH_OR_DARE = [
  { type: "Truth", text: "What's your most embarrassing road trip story?" },
  { type: "Truth", text: "Who in the car do you trust most with the aux?" },
  { type: "Dare", text: "Sing the next song in an accent of your choice." },
  { type: "Dare", text: "Make up a fake backstory for the next car we pass." },
  { type: "Truth", text: "What's the last lie you told on a road trip?" },
  { type: "Dare", text: "Narrate the next 60 seconds like a nature documentary." },
  { type: "Truth", text: "What's the worst snack you've ever bought at a gas station?" },
  { type: "Dare", text: "Do your best impression of the driver." },
];

function pickRandom(list, exclude) {
  if (list.length <= 1) return list[0];
  let next = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (next === exclude && guard < 10) {
    next = list[Math.floor(Math.random() * list.length)];
    guard++;
  }
  return next;
}

const GAME_SECTIONS = [
  {
    title: "Quick Picks",
    subtitle: "Tap, play, pass the phone.",
    games: [
      {
        id: "wyr",
        title: "Would You Rather",
        blurb: "Big debates for long stretches of road.",
      },
      {
        id: "trivia",
        title: "Road Trivia",
        blurb: "Tap to reveal the answer.",
      },
      {
        id: "ispy",
        title: "I Spy",
        blurb: "First one to spot it wins.",
      },
      {
        id: "td",
        title: "Truth or Dare",
        blurb: "Mile-marker edition.",
      },
    ],
  },
  {
    title: "Interactive Vocal Games",
    subtitle: "Eyes on the road. Brains engaged.",
    games: [
      {
        id: "ghost",
        title: "Ghost",
        blurb: "Word-chain battle with a built-in dictionary referee.",
      },
      {
        id: "lie",
        title: "The Intricate Lie",
        blurb: "Bluffing game — the passenger tracks the points.",
      },
      {
        id: "hideseek",
        title: "Virtual Hide & Seek",
        blurb: "Hide in a \"room\", answer yes/no questions to be found.",
      },
      {
        id: "plate",
        title: "License Plate Game",
        blurb: "Interactive SVG map — log every state you spot.",
      },
    ],
  },
];

export default function GamesScreen({ visible, onClose, accent = "#a855f7" }) {
  const [activeGame, setActiveGame] = useState(null);

  const sections = useMemo(() => GAME_SECTIONS, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="px-6 pt-12 pb-4 flex-row items-center justify-between border-b border-slate-100">
          <View>
            <Text className="text-xs uppercase tracking-widest text-slate-500">
              Entertainment
            </Text>
            <Text className="text-2xl font-black text-slate-900 mt-1">
              Road Games
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setActiveGame(null);
              onClose();
            }}
            className="px-4 py-2 rounded-full bg-slate-100"
          >
            <Text className="text-slate-700 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {!activeGame ? (
          <ScrollView className="flex-1 px-6 pt-5">
            {sections.map((section) => (
              <View key={section.title} className="mb-2">
                <Text className="text-xs uppercase tracking-widest text-slate-500 mt-3">
                  {section.title}
                </Text>
                {section.subtitle && (
                  <Text className="text-slate-400 text-xs mb-3">
                    {section.subtitle}
                  </Text>
                )}
                {section.games.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setActiveGame(g.id)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-3"
                  >
                    <Text className="text-slate-900 font-bold text-lg">
                      {g.title}
                    </Text>
                    <Text className="text-slate-500 text-sm mt-1">
                      {g.blurb}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <View className="h-10" />
          </ScrollView>
        ) : (
          <GameRunner
            gameId={activeGame}
            accent={accent}
            onBack={() => setActiveGame(null)}
          />
        )}
      </View>
    </Modal>
  );
}

function GameRunner({ gameId, accent, onBack }) {
  return (
    <View className="flex-1">
      <View className="px-6 pt-4 pb-2">
        <TouchableOpacity onPress={onBack}>
          <Text className="text-slate-500">← All games</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        {gameId === "wyr" && <WouldYouRather accent={accent} />}
        {gameId === "trivia" && <Trivia accent={accent} />}
        {gameId === "ispy" && <ISpy accent={accent} />}
        {gameId === "td" && <TruthOrDare accent={accent} />}
        {gameId === "ghost" && <Ghost accent={accent} />}
        {gameId === "lie" && <IntricateLie accent={accent} />}
        {gameId === "hideseek" && <VirtualHideAndSeek accent={accent} />}
        {gameId === "plate" && <LicensePlateMap accent={accent} />}
      </View>
    </View>
  );
}

function WouldYouRather({ accent }) {
  const [prompt, setPrompt] = useState(WOULD_YOU_RATHER[0]);
  return (
    <View className="flex-1 pt-6">
      <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        Would You Rather
      </Text>
      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <Text className="text-slate-900 text-xl font-semibold leading-7">
          {prompt}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setPrompt(pickRandom(WOULD_YOU_RATHER, prompt))}
        className="mt-6 rounded-2xl p-5"
        style={{ backgroundColor: accent }}
      >
        <Text className="text-white text-center font-bold text-base">
          Next question
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Trivia({ accent }) {
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const q = TRIVIA[idx];

  const next = () => {
    setShowAnswer(false);
    setIdx((i) => (i + 1) % TRIVIA.length);
  };

  return (
    <View className="flex-1 pt-6">
      <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        Question {idx + 1} / {TRIVIA.length}
      </Text>
      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-4">
        <Text className="text-slate-900 text-xl font-semibold leading-7">
          {q.q}
        </Text>
      </View>
      {showAnswer ? (
        <View
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: accent + "22", borderWidth: 1, borderColor: accent }}
        >
          <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: accent }}>
            Answer
          </Text>
          <Text className="text-slate-900 text-base font-medium">{q.a}</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAnswer(true)}
          className="bg-slate-900 rounded-2xl p-5 mb-4"
        >
          <Text className="text-white text-center font-bold">Reveal answer</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={next}
        className="rounded-2xl p-5"
        style={{ backgroundColor: accent }}
      >
        <Text className="text-white text-center font-bold">Next question</Text>
      </TouchableOpacity>
    </View>
  );
}

function ISpy({ accent }) {
  const [prompt, setPrompt] = useState(ISPY_PROMPTS[0]);
  return (
    <View className="flex-1 pt-6">
      <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        I Spy with my little eye...
      </Text>
      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <Text className="text-slate-900 text-2xl font-bold leading-8">
          {prompt}
        </Text>
      </View>
      <Text className="text-slate-500 text-sm mt-3">
        First one to spot it calls "Spy!"
      </Text>
      <TouchableOpacity
        onPress={() => setPrompt(pickRandom(ISPY_PROMPTS, prompt))}
        className="mt-6 rounded-2xl p-5"
        style={{ backgroundColor: accent }}
      >
        <Text className="text-white text-center font-bold">New spy</Text>
      </TouchableOpacity>
    </View>
  );
}

function TruthOrDare({ accent }) {
  const [card, setCard] = useState(TRUTH_OR_DARE[0]);
  return (
    <View className="flex-1 pt-6">
      <Text className="text-xs uppercase tracking-widest mb-2" style={{ color: accent }}>
        {card.type}
      </Text>
      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <Text className="text-slate-900 text-xl font-semibold leading-7">
          {card.text}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setCard(pickRandom(TRUTH_OR_DARE, card))}
        className="mt-6 rounded-2xl p-5"
        style={{ backgroundColor: accent }}
      >
        <Text className="text-white text-center font-bold">Next card</Text>
      </TouchableOpacity>
    </View>
  );
}
