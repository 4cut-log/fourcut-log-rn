import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  visible: boolean;
  title: string;
  desc?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  desc,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {desc ? <Text style={styles.desc}>{desc}</Text> : null}
          <View style={styles.divider} />
          <View style={styles.buttonRow}>
            {cancelText && onCancel ? (
              <>
                <TouchableOpacity style={styles.halfBtn} onPress={onConfirm}>
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
                <View style={styles.verticalDivider} />
                <TouchableOpacity style={styles.halfBtn} onPress={onCancel}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.fullBtn} onPress={onConfirm}>
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: SCREEN_WIDTH - scaleWidth(60),
    backgroundColor: '#fff',
    borderRadius: scaleWidth(14),
    overflow: 'hidden',
  },
  title: {
    ...textStyle({fontSize: scaleFont(18), fontWeight: '600', color: '#111'}),
    textAlign: 'center',
    paddingVertical: scaleHeight(24),
    paddingHorizontal: scaleWidth(20),
  },
  desc: {
    ...textStyle({fontSize: scaleFont(15), color: '#888'}),
    textAlign: 'center',
    marginTop: -scaleHeight(12),
    marginBottom: scaleHeight(20),
    paddingHorizontal: scaleWidth(20),
  },
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0'},
  buttonRow: {flexDirection: 'row'},
  halfBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleHeight(16),
  },
  fullBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleHeight(16),
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
  },
  confirmText: {
    ...textStyle({fontSize: scaleFont(18), fontWeight: '500', color: '#3478F6'}),
  },
  cancelText: {
    ...textStyle({fontSize: scaleFont(18), color: '#888'}),
  },
});
