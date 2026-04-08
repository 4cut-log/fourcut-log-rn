import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';


interface Tag {
  tagId: string;
  tagName: string;
  color: string;
}

interface Props {
  date?: string;
  tags?: Tag[];
  location?: string;
  memoCtt?: string;
}

export default function FlogInfoSection({date, tags, location, memoCtt}: Props) {
  return (
    <View style={styles.infoSection}>
      <InfoRow label="언제" required>
        <Text style={styles.infoText}>{date ?? '-'}</Text>
      </InfoRow>

      <InfoRow label="누구랑" centered>
        {tags && tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.map(tag => (
              <View
                key={tag.tagId}
                style={[styles.tag, {backgroundColor: tag.color}]}>
                <Text style={styles.tagText}>{tag.tagName}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.infoText}>-</Text>
        )}
      </InfoRow>

      <InfoRow label="어디서">
        <Text style={styles.infoText}>{location || '-'}</Text>
      </InfoRow>

      <InfoRow label="메모" last>
        <Text style={styles.infoText}>{memoCtt || '-'}</Text>
      </InfoRow>
    </View>
  );
}

function InfoRow({
  label,
  required,
  last,
  centered,
  children,
}: {
  label: string;
  required?: boolean;
  last?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast, centered && styles.rowCentered]}>
      <View style={[styles.labelWrap, centered && styles.labelWrapCentered]}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.valueWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    marginHorizontal: scaleWidth(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scaleHeight(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  rowLast: {borderBottomWidth: 0},
  rowCentered: {alignItems: 'center'},
  labelWrap: {
    flexDirection: 'row',
    width: scaleWidth(64),
    paddingTop: scaleHeight(2),
  },
  labelWrapCentered: {paddingTop: 0},
  label: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '500', color: '#111'}),
  },
  required: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '500', color: '#E0494B'}),
  },
  valueWrap: {flex: 1},
  infoText: {
    ...textStyle({fontSize: scaleFont(17), color: '#333'}),
    lineHeight: scaleFont(24),
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(6),
  },
  tag: {
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(18),
    paddingVertical: scaleHeight(10),
  },
  tagText: {
    ...textStyle({fontSize: scaleFont(16), color: '#333'}),
  },
});
