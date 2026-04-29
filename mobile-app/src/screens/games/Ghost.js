import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Keyboard,
} from "react-native";
import { getThemeSurfaces } from "../../themes/manifestoThemes";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const GHOST = ["G", "H", "O", "S", "T"];
const DICT_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

async function isDictionaryWord(word) {
  const clean = word.trim().toLowerCase();
  if (!clean) return { ok: false, known: true };
  try {
    const res = await fetch(DICT_URL + encodeURIComponent(clean));
    if (res.status === 200) return { ok: true, known: true };
    if (res.status === 404) return { ok: false, known: true };
    return { ok: false, known: false };
  } catch (err) {
    return { ok: false, known: false };
  }
}

/**
 * Ghost — vocal word-chain game.
 *
 * Players alternate adding letters to a shared fragment. A letter that
 * completes a real word of 4+ letters loses the round. On your turn you
 * may also Challenge instead of adding a letter — the opponent must
 * declare a valid word starting with the fragment. The built-in
 * dictionary referee (dictionaryapi.dev) settles disputes.
 *
 * First to spell G-H-O-S-T loses the match.
 */
export default function Ghost({ accent = "#a855f7", surfaces: injected }) {
  const surfaces = injected ?? getThemeSurfaces(null);
  const [p1Name, setP1Name] = useState("Driver");
  const [p2Name, setP2Name] = useState("Passenger");
  const [editingNames, setEditingNames] = useState(true);

  const [fragment, setFragment] = useState("");
  const [turn, setTurn] = useState(0); // 0 = p1, 1 = p2 (who acts next)
  const [lastAdder, setLastAdder] = useState(null); // who added the most recent letter
  const [scores, setScores] = useState([0, 0]); // letters of GHOST earned
  const [roundStarter, setRoundStarter] = useState(0);

  const [checking, setChecking] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeWord, setChallengeWord] = useState("");
  const [resultModal, setResultModal] = useState(null);
  const [matchOverModal, setMatchOverModal] = useState(null);

  const names = [p1Name, p2Name];

  const resetRound = useCallback((nextStarter) => {
    setFragment("");
    setLastAdder(null);
    setTurn(nextStarter);
    setRoundStarter(nextStarter);
  }, []);

  const awardLossTo = useCallback(
    (loserIdx, reason) => {
      setScores((prev) => {
        const next = [...prev];
        next[loserIdx] = Math.min(prev[loserIdx] + 1, GHOST.length);
        if (next[loserIdx] >= GHOST.length) {
          setMatchOverModal({ loser: loserIdx, reason });
        } else {
          setResultModal({ loser: loserIdx, reason });
        }
        return next;
      });
      resetRound(loserIdx === 0 ? 1 : 0);
    },
    [resetRound]
  );

  const addLetter = useCallback(
    async (letter) => {
      if (checking) return;
      const next = (fragment + letter).toLowerCase();
      const adder = turn;
      setFragment(next);
      setLastAdder(adder);
      setTurn(adder === 0 ? 1 : 0);

      if (next.length >= 4) {
        setChecking(true);
        const { ok, known } = await isDictionaryWord(next);
        setChecking(false);
        if (ok) {
          awardLossTo(
            adder,
            `"${next}" is a real word (${next.length} letters).`
          );
        } else if (!known) {
          // Dictionary unreachable — let the game continue.
        }
      }
    },
    [checking, fragment, turn, awardLossTo]
  );

  const openChallenge = () => {
    if (!fragment || lastAdder === null) return;
    setChallengeWord("");
    setChallengeOpen(true);
  };

  const submitChallenge = async () => {
    const word = challengeWord.trim().toLowerCase();
    if (!word) return;
    const challengedIdx = lastAdder;
    const challengerIdx = turn;
    setChecking(true);
    const { ok, known } = await isDictionaryWord(word);
    setChecking(false);

    const startsWithFragment = word.startsWith(fragment.toLowerCase());
    const longerThanFragment = word.length > fragment.length;

    setChallengeOpen(false);

    if (!known) {
      setResultModal({
        loser: null,
        reason:
          "Dictionary is unreachable. Decide the round off-device, then tap who lost.",
      });
      return;
    }

    if (ok && startsWithFragment && longerThanFragment) {
      awardLossTo(
        challengerIdx,
        `${names[challengedIdx]} produced "${word}". Challenger loses.`
      );
    } else {
      const why = !ok
        ? `"${word}" isn't in the dictionary.`
        : !startsWithFragment
        ? `"${word}" doesn't start with "${fragment}".`
        : `"${word}" must be longer than the fragment.`;
      awardLossTo(challengedIdx, `Challenge succeeded — ${why}`);
    }
  };

  const manualAward = (idx) => {
    setResultModal(null);
    awardLossTo(idx, "Manual call.");
  };

  const resetMatch = () => {
    setScores([0, 0]);
    setMatchOverModal(null);
    setResultModal(null);
    resetRound(0);
  };

  if (editingNames) {
    return (
      <ScrollView
        className="flex-1 pt-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text
          className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
        >
          Ghost · Word Chain
        </Text>
        <Text
          className={`text-xl font-semibold leading-7 mb-4 ${surfaces.titleText}`}
        >
          Who's playing?
        </Text>
        <Text className={`text-sm mb-4 leading-5 ${surfaces.mutedText}`}>
          Take turns adding a letter. Don't finish a real word (4+ letters).
          Challenge when you think the fragment can't lead to one. First to
          spell GHOST loses.
        </Text>

        <Text
          className={`text-xs uppercase tracking-wider mb-1 ${surfaces.subtleText}`}
        >
          Player 1
        </Text>
        <TextInput
          value={p1Name}
          onChangeText={setP1Name}
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
          Player 2
        </Text>
        <TextInput
          value={p2Name}
          onChangeText={setP2Name}
          placeholder="Passenger"
          placeholderTextColor={surfaces.placeholderColor}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          className={`p-4 rounded-xl mb-6 ${surfaces.inputBg}`}
        />

        <TouchableOpacity
          onPress={() => {
            const n1 = p1Name.trim() || "Player 1";
            const n2 = p2Name.trim() || "Player 2";
            setP1Name(n1);
            setP2Name(n2);
            setEditingNames(false);
          }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-white text-center font-bold text-base">
            Start match
          </Text>
        </TouchableOpacity>
        <View className="h-10" />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 pt-4" keyboardShouldPersistTaps="handled">
      <View className="flex-row mb-4">
        {[0, 1].map((i) => (
          <View
            key={i}
            className={`flex-1 rounded-2xl p-4 mx-1 ${surfaces.cardBg}`}
            style={
              turn === i
                ? { borderColor: accent, backgroundColor: accent + "22" }
                : undefined
            }
          >
            <Text
              className={`text-xs uppercase tracking-wider ${surfaces.subtleText}`}
            >
              {turn === i ? "Acting now" : "Waiting"}
            </Text>
            <Text
              className={`font-bold text-base mt-1 ${surfaces.titleText}`}
            >
              {names[i]}
            </Text>
            <View className="flex-row mt-2">
              {GHOST.map((l, idx) => {
                const earned = idx < scores[i];
                return (
                  <Text
                    key={idx}
                    className="font-black text-lg mr-1"
                    style={{
                      color: earned
                        ? accent
                        : surfaces.isDark
                        ? "rgba(255,255,255,0.25)"
                        : "#cbd5e1",
                    }}
                  >
                    {l}
                  </Text>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View
        className={`rounded-2xl p-6 mb-4 items-center ${surfaces.cardBg}`}
      >
        <Text
          className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
        >
          Fragment
        </Text>
        <Text
          className={`font-black tracking-widest ${surfaces.titleText}`}
          style={{ fontSize: 36, letterSpacing: 6 }}
        >
          {fragment ? fragment.toUpperCase() : "—"}
        </Text>
        <Text className={`text-xs mt-2 ${surfaces.mutedText}`}>
          {fragment.length} letter{fragment.length === 1 ? "" : "s"}
        </Text>
      </View>

      <Text className={`font-semibold mb-2 ${surfaces.titleText}`}>
        {names[turn]}'s turn — tap a letter
      </Text>
      <View className="flex-row flex-wrap -mx-1 mb-3">
        {LETTERS.map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => addLetter(letter)}
            disabled={checking}
            className="m-1 rounded-xl items-center justify-center"
            style={{
              width: 38,
              height: 44,
              backgroundColor: surfaces.isDark
                ? "rgba(255,255,255,0.08)"
                : "#f8fafc",
              borderWidth: 1,
              borderColor: surfaces.isDark
                ? "rgba(255,255,255,0.15)"
                : "#e2e8f0",
              opacity: checking ? 0.5 : 1,
            }}
          >
            <Text className={`font-bold text-lg ${surfaces.titleText}`}>
              {letter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={openChallenge}
        disabled={!fragment || lastAdder === null || checking}
        className="rounded-2xl p-4 mb-2"
        style={{
          backgroundColor: accent,
          opacity: !fragment || lastAdder === null || checking ? 0.4 : 1,
        }}
      >
        <Text className="text-white text-center font-bold">
          Challenge {lastAdder !== null ? names[lastAdder] : ""}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => resetRound(roundStarter === 0 ? 1 : 0)}
        className="rounded-2xl p-3 mb-8"
      >
        <Text className={`text-center font-semibold ${surfaces.mutedText}`}>
          Skip round
        </Text>
      </TouchableOpacity>

      {checking && (
        <View className="flex-row items-center justify-center mb-6">
          <ActivityIndicator color={accent} />
          <Text className={`ml-2 ${surfaces.mutedText}`}>
            Consulting the referee…
          </Text>
        </View>
      )}

      <Modal
        visible={challengeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setChallengeOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setChallengeOpen(false)}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full"
            onPress={() => {}}
          >
            <Text className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Challenge
            </Text>
            <Text className="text-slate-900 text-xl font-black mb-3">
              {lastAdder !== null ? names[lastAdder] : ""}, name your word
            </Text>
            <Text className="text-slate-500 text-sm mb-4">
              It must start with "{fragment.toUpperCase()}" and be longer than
              the fragment.
            </Text>
            <TextInput
              value={challengeWord}
              onChangeText={setChallengeWord}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={submitChallenge}
              placeholder={fragment + "…"}
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
            />
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setChallengeOpen(false)}
                className="flex-1 rounded-2xl p-4 bg-slate-100 mr-2"
              >
                <Text className="text-slate-700 text-center font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitChallenge}
                className="flex-1 rounded-2xl p-4"
                style={{ backgroundColor: accent }}
              >
                <Text className="text-white text-center font-bold">
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!resultModal}
        transparent
        animationType="fade"
        onRequestClose={() => setResultModal(null)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setResultModal(null)}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full"
            onPress={() => {}}
          >
            {resultModal?.loser !== null && resultModal?.loser !== undefined ? (
              <>
                <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: accent }}>
                  Round over
                </Text>
                <Text className="text-slate-900 text-2xl font-black mb-2">
                  {names[resultModal.loser]} takes a letter
                </Text>
                <Text className="text-slate-500 mb-5">
                  {resultModal.reason}
                </Text>
                <TouchableOpacity
                  onPress={() => setResultModal(null)}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: accent }}
                >
                  <Text className="text-white text-center font-bold">
                    Next round
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                  Referee offline
                </Text>
                <Text className="text-slate-900 text-lg font-bold mb-5">
                  {resultModal?.reason}
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => manualAward(0)}
                    className="flex-1 rounded-2xl p-4 bg-slate-100 mr-2"
                  >
                    <Text className="text-slate-900 text-center font-bold">
                      {names[0]} lost
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => manualAward(1)}
                    className="flex-1 rounded-2xl p-4 bg-slate-100"
                  >
                    <Text className="text-slate-900 text-center font-bold">
                      {names[1]} lost
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!matchOverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMatchOverModal(null)}
      >
        <Pressable
          className="flex-1 bg-black/60 items-center justify-center px-6"
          onPress={() => {}}
        >
          <View className="bg-white rounded-3xl p-6 w-full items-center">
            <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: accent }}>
              GHOST
            </Text>
            <Text className="text-slate-900 text-3xl font-black text-center mb-2">
              {matchOverModal ? names[matchOverModal.loser] : ""} spelled GHOST
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              {matchOverModal?.reason}
            </Text>
            <TouchableOpacity
              onPress={resetMatch}
              className="rounded-2xl px-6 py-4 w-full"
              style={{ backgroundColor: accent }}
            >
              <Text className="text-white text-center font-bold">
                Play again
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <View className="h-16" />
    </ScrollView>
  );
}
