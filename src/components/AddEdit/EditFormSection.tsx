import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
} from 'react-native';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

interface Props {
  dateText: string;
  onDatePress: () => void;
  withContent: React.ReactNode;
  where: string;
  onWhereChange: (text: string) => void;
  memo: string;
  onMemoChange: (text: string) => void;
  onMemoFocus?: () => void;
}

export default function EditFormSection({
  dateText,
  onDatePress,
  withContent,
  where,
  onWhereChange,
  memo,
  onMemoChange,
  onMemoFocus,
}: Props) {
  return (
    <View style={styles.form}>
      <FormRow label="언제" required>
        <TouchableOpacity onPress={onDatePress}>
          <Text style={styles.inputText}>{dateText}</Text>
        </TouchableOpacity>
      </FormRow>

      <FormRow label="누구랑">{withContent}</FormRow>

      <FormRow label="어디서">
        <TextInput
          style={styles.input}
          placeholder="홍대입구, 집앞, 학교앞 ..."
          placeholderTextColor="#C0C0C0"
          value={where}
          onChangeText={onWhereChange}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </FormRow>

      <FormRow label="메모" last>
        <TextInput
          style={styles.input}
          placeholder="최대 100자까지 메모 가능해요 !"
          placeholderTextColor="#C0C0C0"
          value={memo}
          onChangeText={onMemoChange}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={Keyboard.dismiss}
          onFocus={onMemoFocus}
          maxLength={100}
          multiline
        />
      </FormRow>
    </View>
  );
}

function FormRow({
  label,
  required,
  last,
  children,
}: {
  label: string;
  required?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {marginHorizontal: scaleWidth(20)},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  rowLast: {borderBottomWidth: 0},
  labelWrap: {
    flexDirection: 'row',
    width: scaleWidth(64),
    alignItems: 'center',
  },
  label: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '500', color: '#111'}),
  },
  required: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '500', color: '#E0494B'}),
  },
  inputWrap: {flex: 1},
  input: {...textStyle({fontSize: scaleFont(17), color: '#333'}), padding: 0},
  inputText: {...textStyle({fontSize: scaleFont(17), color: '#333'})},
});
