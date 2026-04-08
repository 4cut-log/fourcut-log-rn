import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {_useFetch} from '@hooks/useFetch';
import {updateNickname, UserProfile} from '@api/user';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const {data: profileRes, isLoading} = _useFetch<{
    status: number;
    data: UserProfile;
    message: string;
  }>('/users/me', ['userProfile']);

  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profileRes?.data?.nickname) {
      setNickname(profileRes.data.nickname);
    }
  }, [profileRes]);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await updateNickname(trimmed);
      queryClient.invalidateQueries({queryKey: ['userProfile']});
      navigation.goBack();
    } catch {
      Alert.alert('저장 실패', '다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator style={{flex: 1}} color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Image
            source={require('@images/common/backIcon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={8}>
          {saving ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <Text style={styles.saveBtn}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor="#ccc"
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        <Text style={styles.hint}>{nickname.trim().length} / 20</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  backIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    ...textStyle({fontSize: scaleFont(18), fontWeight: '600', color: '#111'}),
  },
  saveBtn: {
    ...textStyle({fontSize: scaleFont(16), fontWeight: '600', color: '#111'}),
  },
  body: {
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(32),
  },
  label: {
    ...textStyle({fontSize: scaleFont(14), color: '#888'}),
    marginBottom: scaleHeight(8),
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#111',
    paddingVertical: scaleHeight(8),
    ...textStyle({fontSize: scaleFont(18), color: '#111'}),
  },
  hint: {
    ...textStyle({fontSize: scaleFont(13), color: '#bbb'}),
    textAlign: 'right',
    marginTop: scaleHeight(6),
  },
});
