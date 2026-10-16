import { useRef } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { uddoktaPayConfig } from '@/services/uddoktapay/config';
import { parseQueryParams } from '@/services/uddoktapay/client';
import { AppText } from './AppText';

export type UddoktaPayCallbackStatus = 'redirect' | 'cancel';

interface UddoktaPayCheckoutModalProps {
  visible: boolean;
  paymentUrl: string | null;
  onCallback: (status: UddoktaPayCallbackStatus, invoiceId: string | null) => void;
  onClose: () => void;
}

export function UddoktaPayCheckoutModal({ visible, paymentUrl, onCallback, onClose }: UddoktaPayCheckoutModalProps) {
  const { colors } = useTheme();
  const handled = useRef(false);

  const handleShouldStart = (request: ShouldStartLoadRequest): boolean => {
    const url = request.url;
    if (handled.current) return true;

    if (url.startsWith(uddoktaPayConfig.cancelUrl)) {
      handled.current = true;
      onCallback('cancel', null);
      return false;
    }
    if (url.startsWith(uddoktaPayConfig.redirectUrl)) {
      handled.current = true;
      const params = parseQueryParams(url);
      onCallback('redirect', params.invoice_id ?? null);
      return false;
    }
    return true;
  };

  const handleClose = () => {
    handled.current = false;
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <AppText weight="semibold" size={15}>
          পেমেন্ট
        </AppText>
        <View style={{ width: 26 }} />
      </View>
      {paymentUrl && (
        <WebView
          source={{ uri: paymentUrl }}
          onShouldStartLoadWithRequest={handleShouldStart}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
