import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useShopStore } from '@/store/useShopStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useEntryStore } from '@/store/useEntryStore';
import { useCreditStore } from '@/store/useCreditStore';
import { listEntries, getSummary } from '@/db/repositories/entries';
import { exportAllData, restoreAllData } from '@/db/backup';
import { buildEntriesCsv, buildEntriesHtml } from '@/utils/exportFormat';
import { startOfMonth, todayIso } from '@/utils/dateFormat';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { DatePickerField } from '@/components/DatePickerField';
import { ToggleTabs } from '@/components/ToggleTabs';

const EARLIEST_DATE = '2000-01-01';

function writeCacheFile(filename: string, content: string): string {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  return file.uri;
}

function isWebUnsupported(): boolean {
  if (Platform.OS === 'web') {
    Alert.alert('সমর্থিত নয়', 'এই ফিচারটি মোবাইল অ্যাপে (Android/iOS) ব্যবহার করুন।');
    return true;
  }
  return false;
}

export function BackupExportScreen() {
  const { colors, spacing, radii } = useTheme();
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const shops = useShopStore((s) => s.shops);
  const loadShops = useShopStore((s) => s.loadShops);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const resetCategories = useCategoryStore((s) => s.reset);
  const bumpEntries = useEntryStore((s) => s.bump);
  const bumpCredits = useCreditStore((s) => s.bump);

  const shop = shops.find((s) => s.id === activeShopId);

  const [rangeMode, setRangeMode] = useState<'month' | 'all'>('month');
  const [fromDate, setFromDate] = useState(startOfMonth(todayIso()));
  const [toDate, setToDate] = useState(todayIso());
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const getRange = () => (rangeMode === 'all' ? { from: EARLIEST_DATE, to: todayIso() } : { from: fromDate, to: toDate });

  const handleExportCsv = async () => {
    if (isWebUnsupported() || !activeShopId || !shop) return;
    setExporting('csv');
    try {
      const { from, to } = getRange();
      const entries = await listEntries(activeShopId, { dateFrom: from, dateTo: to });
      const csv = buildEntriesCsv(entries);
      const fileUri = writeCacheFile(`dokan-hisab-${todayIso()}.csv`, csv);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'এক্সপোর্ট শেয়ার করুন' });
    } catch (e) {
      Alert.alert('ত্রুটি', 'এক্সপোর্ট করা যায়নি');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (isWebUnsupported() || !activeShopId || !shop) return;
    setExporting('pdf');
    try {
      const { from, to } = getRange();
      const entries = await listEntries(activeShopId, { dateFrom: from, dateTo: to });
      const summary = await getSummary(activeShopId, from, to);
      const html = buildEntriesHtml(entries, shop.name, summary.income, summary.expense);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'এক্সপোর্ট শেয়ার করুন' });
    } catch (e) {
      Alert.alert('ত্রুটি', 'এক্সপোর্ট করা যায়নি');
    } finally {
      setExporting(null);
    }
  };

  const handleBackup = async () => {
    if (isWebUnsupported()) return;
    setBacking(true);
    try {
      const data = await exportAllData();
      const fileUri = writeCacheFile(`dokan-hisab-backup-${todayIso()}.json`, JSON.stringify(data));
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'ব্যাকআপ শেয়ার করুন' });
    } catch (e) {
      Alert.alert('ত্রুটি', 'ব্যাকআপ তৈরি করা যায়নি');
    } finally {
      setBacking(false);
    }
  };

  const performRestore = async (uri: string) => {
    setRestoring(true);
    try {
      const content = await new File(uri).text();
      const data = JSON.parse(content);
      await restoreAllData(data);
      await loadSettings();
      await loadShops();
      resetCategories();
      bumpEntries();
      bumpCredits();
      Alert.alert('সম্পন্ন', 'ব্যাকআপ থেকে ডেটা রিস্টোর করা হয়েছে');
    } catch (e) {
      Alert.alert('ত্রুটি', 'ব্যাকআপ ফাইলটি সঠিক নয় বা রিস্টোর করা যায়নি');
    } finally {
      setRestoring(false);
    }
  };

  const handleRestore = async () => {
    if (isWebUnsupported()) return;
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;

    Alert.alert(
      'রিস্টোর করবেন?',
      'বর্তমান সব দোকানের ডেটা মুছে ব্যাকআপ ফাইলের ডেটা দিয়ে প্রতিস্থাপিত হবে। এই কাজ ফিরিয়ে নেওয়া যাবে না।',
      [
        { text: 'বাতিল', style: 'cancel' },
        { text: 'রিস্টোর করুন', style: 'destructive', onPress: () => performRestore(uri) },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}>
          <AppText weight="bold" size={16} style={{ marginBottom: 4 }}>
            ডেটা এক্সপোর্ট করুন
          </AppText>
          <AppText size={12} color={colors.textMuted} style={{ marginBottom: 14 }}>
            {shop?.name} দোকানের এন্ট্রি CSV বা PDF আকারে শেয়ার করুন
          </AppText>

          <ToggleTabs
            options={[
              { key: 'month', label: 'নির্দিষ্ট সময়' },
              { key: 'all', label: 'সব ডেটা' },
            ]}
            value={rangeMode}
            onChange={(k) => setRangeMode(k as 'month' | 'all')}
          />

          {rangeMode === 'month' && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <DatePickerField value={fromDate} onChange={setFromDate} />
              <DatePickerField value={toDate} onChange={setToDate} />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Button
              label="CSV এক্সপোর্ট"
              variant="secondary"
              onPress={handleExportCsv}
              loading={exporting === 'csv'}
              style={{ flex: 1 }}
            />
            <Button label="PDF এক্সপোর্ট" onPress={handleExportPdf} loading={exporting === 'pdf'} style={{ flex: 1 }} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}>
          <AppText weight="bold" size={16} style={{ marginBottom: 4 }}>
            ব্যাকআপ
          </AppText>
          <AppText size={12} color={colors.textMuted} style={{ marginBottom: 14 }}>
            সব দোকানের সম্পূর্ণ ডেটার ব্যাকআপ নিন — ফোন পরিবর্তন করলেও ডেটা হারাবে না
          </AppText>
          <Button label="ব্যাকআপ তৈরি করুন" onPress={handleBackup} loading={backing} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.expenseBg, borderColor: colors.expense, borderRadius: radii.lg },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="warning-outline" size={18} color={colors.expense} />
            <AppText weight="bold" size={16} color={colors.expense} style={{ marginLeft: 6 }}>
              ব্যাকআপ থেকে রিস্টোর করুন
            </AppText>
          </View>
          <AppText size={12} color={colors.expense} style={{ marginBottom: 14 }}>
            সতর্কতা: রিস্টোর করলে বর্তমান সব ডেটা মুছে ব্যাকআপ ফাইলের ডেটা দিয়ে প্রতিস্থাপিত হবে
          </AppText>
          <Button label="ব্যাকআপ থেকে রিস্টোর করুন" variant="danger" onPress={handleRestore} loading={restoring} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 16, marginBottom: 16 },
});
