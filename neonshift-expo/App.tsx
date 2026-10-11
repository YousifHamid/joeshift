import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from './src/theme/colors';
import {
  GameSettings,
  LocalGameRepository,
  LocalRecord,
} from './src/data/LocalGameRepository';
import { DEFAULT_SKIN_ID, SkinId } from './src/game/VehicleSkins';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LeaderboardModal } from './src/components/LeaderboardModal';
import { SettingsModal } from './src/components/SettingsModal';
import { HangarModal } from './src/components/HangarModal';
import { RewardModal } from './src/components/RewardModal';
import { SoundEffects } from './src/audio/SoundEffects';
import { HapticsManager } from './src/audio/HapticsManager';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'MENU' | 'GAME'>('MENU');

  const [bestScore, setBestScore] = useState<number>(0);
  const [bestDistance, setBestDistance] = useState<number>(0);
  const [gamerTag, setGamerTag] = useState<string>('CYBER_RUNNER');
  const [credits, setCredits] = useState<number>(150);
  const [unlockedSkins, setUnlockedSkins] = useState<SkinId[]>([DEFAULT_SKIN_ID]);
  const [equippedSkin, setEquippedSkin] = useState<SkinId>(DEFAULT_SKIN_ID);
  const [hasHeadstartNitro, setHasHeadstartNitro] = useState<boolean>(false);

  const [savedStage, setSavedStage] = useState<number>(1);
  const [highestStage, setHighestStage] = useState<number>(1);
  const [startStageToPlay, setStartStageToPlay] = useState<number>(1);

  const [settings, setSettings] = useState<GameSettings>({
    musicEnabled: true,
    sfxEnabled: true,
    hapticsEnabled: true,
    controlScheme: 'hybrid',
  });
  const [leaderboard, setLeaderboard] = useState<LocalRecord[]>([]);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const loadUserData = async () => {
    const [score, dist, tag, setts, records, creds, skins, equipped, headstart, savedStg, highestStg] = await Promise.all([
      LocalGameRepository.getBestScore(),
      LocalGameRepository.getBestDistance(),
      LocalGameRepository.getGamerTag(),
      LocalGameRepository.getSettings(),
      LocalGameRepository.getLeaderboard(),
      LocalGameRepository.getCredits(),
      LocalGameRepository.getUnlockedSkins(),
      LocalGameRepository.getEquippedSkin(),
      LocalGameRepository.getHeadstartNitroPerk(),
      LocalGameRepository.getSavedStage(),
      LocalGameRepository.getHighestStage(),
    ]);

    setBestScore(score);
    setBestDistance(dist);
    setGamerTag(tag);
    setSettings(setts);
    setLeaderboard(records);
    setCredits(creds);
    setUnlockedSkins(skins);
    setEquippedSkin(equipped);
    setHasHeadstartNitro(headstart);
    setSavedStage(savedStg);
    setHighestStage(highestStg);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleSaveSettings = async (newSettings: GameSettings, newTag: string) => {
    setSettings(newSettings);
    await LocalGameRepository.saveSettings(newSettings);
    SoundEffects.setMusicEnabled(newSettings.musicEnabled);
    SoundEffects.setSfxEnabled(newSettings.sfxEnabled);
    HapticsManager.setEnabled(newSettings.hapticsEnabled);
    if (newTag !== gamerTag) {
      const savedTag = await LocalGameRepository.setGamerTag(newTag);
      setGamerTag(savedTag);
    }
  };

  const handleEquipSkin = async (skinId: SkinId) => {
    await LocalGameRepository.setEquippedSkin(skinId);
    setEquippedSkin(skinId);
  };

  const handleBuySkin = async (skinId: SkinId, cost: number): Promise<boolean> => {
    const success = await LocalGameRepository.spendCredits(cost);
    if (success) {
      await LocalGameRepository.unlockSkin(skinId);
      await loadUserData();
      return true;
    }
    return false;
  };

  const handleClaimShareReward = async () => {
    await LocalGameRepository.claimShareReward();
    await loadUserData();
  };

  const handleConsumeHeadstartNitro = async () => {
    await LocalGameRepository.setHeadstartNitroPerk(false);
    setHasHeadstartNitro(false);
  };

  const handleResetProgress = async () => {
    await LocalGameRepository.resetStageProgress();
    await loadUserData();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {currentScreen === 'MENU' ? (
        <MainMenuScreen
          bestScore={bestScore}
          bestDistance={bestDistance}
          gamerTag={gamerTag}
          credits={credits}
          savedStage={savedStage}
          highestStage={highestStage}
          hasHeadstartNitro={hasHeadstartNitro}
          onStartGame={(stageToLaunch = 1) => {
            setStartStageToPlay(stageToLaunch);
            setCurrentScreen('GAME');
          }}
          onResetProgress={handleResetProgress}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHangar={() => setShowHangar(true)}
          onOpenRewards={() => setShowRewards(true)}
        />
      ) : (
        <GameScreen
          bestScore={bestScore}
          gamerTag={gamerTag}
          settings={settings}
          equippedSkin={equippedSkin}
          hasHeadstartNitro={hasHeadstartNitro}
          startStage={startStageToPlay}
          onConsumeHeadstartNitro={handleConsumeHeadstartNitro}
          onClaimShareReward={handleClaimShareReward}
          onReturnToMenu={() => {
            loadUserData();
            setCurrentScreen('MENU');
          }}
          onRefreshRecords={loadUserData}
        />
      )}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        visible={showLeaderboard}
        records={leaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        gamerTag={gamerTag}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Custom Hangar Modal */}
      <HangarModal
        visible={showHangar}
        credits={credits}
        unlockedSkins={unlockedSkins}
        equippedSkin={equippedSkin}
        onEquipSkin={handleEquipSkin}
        onBuySkin={handleBuySkin}
        onOpenShareReward={() => {
          setShowHangar(false);
          setShowRewards(true);
        }}
        onClose={() => setShowHangar(false)}
      />

      {/* Pilot Referral & Rewards Modal */}
      <RewardModal
        visible={showRewards}
        credits={credits}
        hasHeadstartNitro={hasHeadstartNitro}
        isSolarGoldUnlocked={unlockedSkins.includes('SOLAR_GOLD')}
        gamerTag={gamerTag}
        onClaimReward={handleClaimShareReward}
        onClose={() => setShowRewards(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

